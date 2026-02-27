package com.wealthtracker.agent;

import com.wealthtracker.model.*;
import com.wealthtracker.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Investment Analysis Agent
 * Analyses the user's portfolio (stocks, mutual funds, FDs, savings)
 * and returns a structured markdown report.
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class InvestmentAnalysisAgent {

    private final ChatModel chatModel;
    private final StockRepository stockRepository;
    private final MutualFundRepository mutualFundRepository;
    private final FixedDepositRepository fixedDepositRepository;
    private final SavingsAccountRepository savingsAccountRepository;

    public String analyze(String userId) {
        try {
            String portfolioData = buildPortfolioData(userId);
            String systemPrompt = """
                    You are an expert investment portfolio analyst. You will receive raw portfolio data
                    and must return a well-structured markdown report with the following sections:
                    
                    ## Portfolio Overview
                    - Total portfolio value
                    - Asset allocation breakdown (as %)
                    
                    ## Holdings Analysis
                    - Breakdown of each asset category with key metrics
                    
                    ## Diversification Assessment
                    - Evaluate whether the portfolio is well-diversified
                    - Identify concentration risks if any
                    
                    ## Key Insights
                    - 3-4 bullet points summarizing the most important observations
                    
                    Be concise, data-driven, and actionable. Use Indian Rupee (₹) formatting.
                    """;

            Prompt prompt = new Prompt(List.of(
                    new SystemMessage(systemPrompt),
                    new UserMessage("Analyze this portfolio data and generate the report:\n\n" + portfolioData)
            ));

            return chatModel.call(prompt).getResult().getOutput().getContent();
        } catch (Exception e) {
            log.error("Error in InvestmentAnalysisAgent: ", e);
            return "Unable to generate portfolio analysis at this time. Please try again.";
        }
    }

    private String buildPortfolioData(String userId) {
        StringBuilder data = new StringBuilder();

        // Stocks
        List<Stock> stocks = stockRepository.findByUserId(userId);
        double stockValue = stocks.stream()
                .mapToDouble(s -> s.getQuantity() * s.getPurchasePrice())
                .sum();
        data.append("=== STOCKS ===\n");
        if (stocks.isEmpty()) {
            data.append("No stock holdings.\n");
        } else {
            stocks.forEach(s -> data.append(String.format(
                    "- %s (%s): %.2f shares @ ₹%.2f each = ₹%.2f (purchased: %s)\n",
                    s.getStockName(), s.getSymbol() != null ? s.getSymbol() : "N/A",
                    s.getQuantity(), s.getPurchasePrice(),
                    s.getQuantity() * s.getPurchasePrice(),
                    s.getPurchaseDate() != null ? s.getPurchaseDate() : "unknown")));
        }
        data.append(String.format("Stock Total: ₹%.2f\n\n", stockValue));

        // Mutual Funds
        List<MutualFund> mutualFunds = mutualFundRepository.findByUserId(userId);
        double mfValue = mutualFunds.stream()
                .mapToDouble(mf -> mf.getUnits() * mf.getNav())
                .sum();
        data.append("=== MUTUAL FUNDS ===\n");
        if (mutualFunds.isEmpty()) {
            data.append("No mutual fund holdings.\n");
        } else {
            mutualFunds.forEach(mf -> data.append(String.format(
                    "- %s: %.4f units @ NAV ₹%.2f = ₹%.2f\n",
                    mf.getFundName(), mf.getUnits(), mf.getNav(), mf.getUnits() * mf.getNav())));
        }
        data.append(String.format("Mutual Fund Total: ₹%.2f\n\n", mfValue));

        // Fixed Deposits
        List<FixedDeposit> fds = fixedDepositRepository.findByUserId(userId);
        double fdValue = fds.stream().mapToDouble(FixedDeposit::getAmount).sum();
        data.append("=== FIXED DEPOSITS / RDs ===\n");
        if (fds.isEmpty()) {
            data.append("No fixed deposits.\n");
        } else {
            fds.forEach(fd -> data.append(String.format(
                    "- %s [%s]: ₹%.2f @ %.2f%% interest, matures: %s\n",
                    fd.getBankName(), fd.getDepositType(),
                    fd.getAmount(), fd.getInterestRate() != null ? fd.getInterestRate() : 0.0,
                    fd.getMaturityDate() != null ? fd.getMaturityDate() : "N/A")));
        }
        data.append(String.format("FD Total: ₹%.2f\n\n", fdValue));

        // Savings
        List<SavingsAccount> savings = savingsAccountRepository.findByUserId(userId);
        double savingsValue = savings.stream().mapToDouble(SavingsAccount::getBalance).sum();
        data.append("=== SAVINGS ACCOUNTS ===\n");
        if (savings.isEmpty()) {
            data.append("No savings accounts.\n");
        } else {
            savings.forEach(sa -> data.append(String.format(
                    "- %s: ₹%.2f\n", sa.getBankName() != null ? sa.getBankName() : "Account", sa.getBalance())));
        }
        data.append(String.format("Savings Total: ₹%.2f\n\n", savingsValue));

        double total = stockValue + mfValue + fdValue + savingsValue;
        data.append(String.format("=== TOTAL PORTFOLIO VALUE: ₹%.2f ===\n", total));
        if (total > 0) {
            data.append(String.format("Allocation: Stocks %.1f%% | MF %.1f%% | FD %.1f%% | Savings %.1f%%\n",
                    (stockValue / total) * 100, (mfValue / total) * 100,
                    (fdValue / total) * 100, (savingsValue / total) * 100));
        }

        return data.toString();
    }
}
