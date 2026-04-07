package com.wealthtracker.controller;

import com.wealthtracker.model.Expense;
import com.wealthtracker.model.FixedDeposit;
import com.wealthtracker.model.SavingsAccount;
import com.wealthtracker.repository.ExpenseRepository;
import com.wealthtracker.repository.FixedDepositRepository;
import com.wealthtracker.repository.SavingsAccountRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/fixed-deposits")
public class FixedDepositController {

    private static final Logger logger = LoggerFactory.getLogger(FixedDepositController.class);

    private final FixedDepositRepository fixedDepositRepository;
    private final SavingsAccountRepository savingsAccountRepository;
    private final ExpenseRepository expenseRepository;

    public FixedDepositController(FixedDepositRepository fixedDepositRepository,
            SavingsAccountRepository savingsAccountRepository, ExpenseRepository expenseRepository) {
        this.fixedDepositRepository = fixedDepositRepository;
        this.savingsAccountRepository = savingsAccountRepository;
        this.expenseRepository = expenseRepository;
    }

    @GetMapping
    public ResponseEntity<List<FixedDeposit>> getAll(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        List<FixedDeposit> deposits = fixedDepositRepository.findByUserId(userId);

        // Process pending RD deductions for all RDs with linked accounts
        for (FixedDeposit deposit : deposits) {
            if ("RD".equals(deposit.getDepositType()) && deposit.getSavingsAccountId() != null) {
                processRDDeductions(deposit, userId);
            }
        }

        return ResponseEntity.ok(fixedDepositRepository.findByUserId(userId));
    }

    private void processRDDeductions(FixedDeposit deposit, String userId) {
        LocalDate startDate = deposit.getStartDate() != null ? deposit.getStartDate() : deposit.getCreatedAt();
        LocalDate lastDeduction = deposit.getLastDeductionDate();
        LocalDate now = LocalDate.now();
        LocalDate maturityDate = deposit.getMaturityDate();

        // Start from the first month of RD or the month after last deduction
        LocalDate processFrom = lastDeduction != null ? lastDeduction.plusMonths(1).withDayOfMonth(1)
                : startDate.withDayOfMonth(1);

        // Process all pending months up to current month or maturity (whichever is
        // earlier)
        LocalDate processUntil = now.isBefore(maturityDate) ? now : maturityDate;

        if (processFrom.isAfter(processUntil)) {
            return; // No deductions to process
        }

        SavingsAccount savingsAccount = savingsAccountRepository.findById(deposit.getSavingsAccountId()).orElse(null);
        if (savingsAccount == null || !savingsAccount.getUserId().equals(userId)) {
            return; // Account not found or doesn't belong to user
        }

        LocalDate currentMonth = processFrom;
        LocalDate lastProcessedMonth = null;
        while (!currentMonth.isAfter(processUntil.withDayOfMonth(1))) {
            // Check if an expense for this deposit and month already exists (idempotent guard)
            LocalDate monthStart = currentMonth.withDayOfMonth(1);
            LocalDate monthEnd = currentMonth.withDayOfMonth(currentMonth.lengthOfMonth());
            boolean alreadyExists = deposit.getId() != null &&
                    expenseRepository.existsBySourceDepositIdAndDateBetween(deposit.getId(), monthStart, monthEnd);

            if (!alreadyExists) {
                // Deduct this month's installment from savings account
                savingsAccount.setBalance(savingsAccount.getBalance() - deposit.getAmount());

                // Create an expense record for this installment
                Expense rdExpense = new Expense();
                rdExpense.setUserId(userId);
                rdExpense.setCategory("RD Installment");
                rdExpense.setAmount(deposit.getAmount());
                rdExpense.setDate(currentMonth);
                rdExpense.setDescription("RD installment of " + deposit.getAmount() + " from " + deposit.getBankName());
                rdExpense.setSavingsAccountId(deposit.getSavingsAccountId());
                rdExpense.setSourceDepositId(deposit.getId());
                expenseRepository.save(rdExpense);
            }

            lastProcessedMonth = currentMonth;
            currentMonth = currentMonth.plusMonths(1);
        }

        if (lastProcessedMonth != null) {
            savingsAccount.setUpdatedAt(LocalDate.now());
            savingsAccountRepository.save(savingsAccount);

            // Update last deduction date
            deposit.setLastDeductionDate(lastProcessedMonth);
            deposit.setUpdatedAt(LocalDate.now());
            fixedDepositRepository.save(deposit);
        }
    }

    @PostMapping
    public ResponseEntity<FixedDeposit> create(@RequestBody FixedDeposit deposit, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        logger.debug("Creating deposit for user: {}", userId);
        deposit.setUserId(userId);
        deposit.setUpdatedAt(LocalDate.now());

        // For RD with linked account, process first month deduction
        if ("RD".equals(deposit.getDepositType()) && deposit.getSavingsAccountId() != null) {
            SavingsAccount savingsAccount = savingsAccountRepository.findById(deposit.getSavingsAccountId())
                    .orElse(null);
            if (savingsAccount != null && savingsAccount.getUserId().equals(userId)) {
                // Set last deduction date to start date's month before saving
                LocalDate startDate = deposit.getStartDate() != null ? deposit.getStartDate() : LocalDate.now();
                deposit.setLastDeductionDate(startDate.withDayOfMonth(1));

                // Save the deposit first so it gets an ID
                FixedDeposit savedDeposit = fixedDepositRepository.save(deposit);

                // Deduct first installment
                savingsAccount.setBalance(savingsAccount.getBalance() - savedDeposit.getAmount());
                savingsAccount.setUpdatedAt(LocalDate.now());
                savingsAccountRepository.save(savingsAccount);

                // Create an expense record for the first installment, tagged with the deposit ID
                Expense firstInstallment = new Expense();
                firstInstallment.setUserId(userId);
                firstInstallment.setCategory("RD Installment");
                firstInstallment.setAmount(savedDeposit.getAmount());
                firstInstallment.setDate(startDate);
                firstInstallment.setDescription("RD installment of " + savedDeposit.getAmount() + " from " + savedDeposit.getBankName());
                firstInstallment.setSavingsAccountId(savedDeposit.getSavingsAccountId());
                firstInstallment.setSourceDepositId(savedDeposit.getId());
                expenseRepository.save(firstInstallment);

                logger.info("New deposit created: {} (Type: {})", savedDeposit.getBankName(), savedDeposit.getDepositType());
                return ResponseEntity.ok(savedDeposit);
            }
        }

        logger.info("New deposit created: {} (Type: {})", deposit.getBankName(), deposit.getDepositType());
        return ResponseEntity.ok(fixedDepositRepository.save(deposit));
    }


    @PutMapping("/{id}")
    public ResponseEntity<FixedDeposit> update(@PathVariable String id, @RequestBody FixedDeposit deposit,
            Authentication auth) {
        String userId = (String) auth.getPrincipal();

        FixedDeposit existingDeposit = fixedDepositRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fixed deposit not found"));

        if (!existingDeposit.getUserId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }

        existingDeposit.setBankName(deposit.getBankName());
        existingDeposit.setAmount(deposit.getAmount());
        existingDeposit.setInterestRate(deposit.getInterestRate());
        existingDeposit.setMaturityDate(deposit.getMaturityDate());
        existingDeposit.setDepositType(deposit.getDepositType());
        existingDeposit.setStartDate(deposit.getStartDate());
        existingDeposit.setSavingsAccountId(deposit.getSavingsAccountId());
        existingDeposit.setUpdatedAt(LocalDate.now());

        return ResponseEntity.ok(fixedDepositRepository.save(existingDeposit));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id, Authentication auth) {
        String userId = (String) auth.getPrincipal();

        FixedDeposit deposit = fixedDepositRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fixed deposit not found"));

        if (!deposit.getUserId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }

        fixedDepositRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
