package com.wealthtracker.service;

import com.wealthtracker.model.*;
import com.wealthtracker.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.azure.openai.AzureOpenAiChatModel;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class AIAssistantService {
    
    private final AzureOpenAiChatModel chatModel;
    private final StockRepository stockRepository;
    private final MutualFundRepository mutualFundRepository;
    private final FixedDepositRepository fixedDepositRepository;
    private final SavingsAccountRepository savingsAccountRepository;
    private final ExpenseRepository expenseRepository;
    private final IncomeRepository incomeRepository;

    public String chat(String userMessage, String userId) {
        try {
            String systemPrompt = buildSystemPrompt(userId);
            
            List<Message> messages = new ArrayList<>();
            messages.add(new SystemMessage(systemPrompt));
            messages.add(new UserMessage(userMessage));
            
            Prompt prompt = new Prompt(messages);
            ChatResponse response = chatModel.call(prompt);
            
            return response.getResult().getOutput().getContent();
        } catch (Exception e) {
            log.error("Error in AI chat: ", e);
            return "I apologize, but I encountered an error processing your request. Please try again.";
        }
    }

    private String buildSystemPrompt(String userId) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are a helpful financial assistant for a wealth tracking application. ");
        prompt.append("Your role is to help users understand their assets, expenses, and provide financial insights.\n\n");
        
        // Add portfolio summary
        prompt.append("PORTFOLIO SUMMARY:\n");
        prompt.append(getPortfolioSummary(userId));
        prompt.append("\n\n");
        
        // Add expense patterns
        prompt.append("EXPENSE PATTERNS:\n");
        prompt.append(getExpensePatterns(userId));
        prompt.append("\n\n");
        
        // Add performance analysis
        prompt.append("PERFORMANCE ANALYSIS:\n");
        prompt.append(getPerformanceAnalysis(userId));
        prompt.append("\n\n");
        
        prompt.append("Guidelines:\n");
        prompt.append("- Provide clear, concise financial advice\n");
        prompt.append("- Use the data provided to give personalized insights\n");
        prompt.append("- Format numbers with currency symbols where appropriate\n");
        prompt.append("- Be encouraging and supportive\n");
        prompt.append("- If asked to add assets, provide step-by-step guidance\n");
        
        return prompt.toString();
    }

    private String getPortfolioSummary(String userId) {
        StringBuilder summary = new StringBuilder();
        
        // Stocks
        List<Stock> stocks = stockRepository.findByUserId(userId);
        double stockValue = stocks.stream()
            .mapToDouble(s -> s.getQuantity() * s.getCurrentPrice())
            .sum();
        summary.append(String.format("Stocks: ₹%.2f (%d holdings)\n", stockValue, stocks.size()));
        
        // Mutual Funds
        List<MutualFund> mutualFunds = mutualFundRepository.findByUserId(userId);
        double mfValue = mutualFunds.stream()
            .mapToDouble(mf -> mf.getUnits() * mf.getCurrentNav())
            .sum();
        summary.append(String.format("Mutual Funds: ₹%.2f (%d funds)\n", mfValue, mutualFunds.size()));
        
        // Fixed Deposits
        List<FixedDeposit> fixedDeposits = fixedDepositRepository.findByUserId(userId);
        double fdValue = fixedDeposits.stream()
            .mapToDouble(FixedDeposit::getPrincipal)
            .sum();
        summary.append(String.format("Fixed Deposits: ₹%.2f (%d FDs)\n", fdValue, fixedDeposits.size()));
        
        // Savings Accounts
        List<SavingsAccount> savingsAccounts = savingsAccountRepository.findByUserId(userId);
        double savingsValue = savingsAccounts.stream()
            .mapToDouble(SavingsAccount::getBalance)
            .sum();
        summary.append(String.format("Savings: ₹%.2f (%d accounts)\n", savingsValue, savingsAccounts.size()));
        
        double totalValue = stockValue + mfValue + fdValue + savingsValue;
        summary.append(String.format("\nTotal Portfolio Value: ₹%.2f\n", totalValue));
        
        // Asset allocation
        if (totalValue > 0) {
            summary.append("\nAsset Allocation:\n");
            summary.append(String.format("- Stocks: %.1f%%\n", (stockValue/totalValue)*100));
            summary.append(String.format("- Mutual Funds: %.1f%%\n", (mfValue/totalValue)*100));
            summary.append(String.format("- Fixed Deposits: %.1f%%\n", (fdValue/totalValue)*100));
            summary.append(String.format("- Savings: %.1f%%\n", (savingsValue/totalValue)*100));
        }
        
        return summary.toString();
    }

    private String getExpensePatterns(String userId) {
        StringBuilder patterns = new StringBuilder();
        
        List<Expense> expenses = expenseRepository.findByUserId(userId);
        List<Income> incomes = incomeRepository.findByUserId(userId);
        
        // Monthly expenses
        Map<String, Double> monthlyExpenses = expenses.stream()
            .collect(Collectors.groupingBy(
                e -> e.getExpenseDate().substring(0, 7), // YYYY-MM
                Collectors.summingDouble(Expense::getAmount)
            ));
        
        // Monthly income
        Map<String, Double> monthlyIncome = incomes.stream()
            .collect(Collectors.groupingBy(
                i -> i.getIncomeDate().substring(0, 7),
                Collectors.summingDouble(Income::getAmount)
            ));
        
        if (!monthlyExpenses.isEmpty()) {
            patterns.append("Recent Monthly Expenses:\n");
            monthlyExpenses.entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByKey().reversed())
                .limit(3)
                .forEach(e -> patterns.append(String.format("- %s: ₹%.2f\n", e.getKey(), e.getValue())));
        }
        
        if (!monthlyIncome.isEmpty()) {
            patterns.append("\nRecent Monthly Income:\n");
            monthlyIncome.entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByKey().reversed())
                .limit(3)
                .forEach(e -> patterns.append(String.format("- %s: ₹%.2f\n", e.getKey(), e.getValue())));
        }
        
        // Category breakdown
        Map<String, Double> categoryExpenses = expenses.stream()
            .collect(Collectors.groupingBy(
                Expense::getCategory,
                Collectors.summingDouble(Expense::getAmount)
            ));
        
        if (!categoryExpenses.isEmpty()) {
            patterns.append("\nTop Expense Categories:\n");
            categoryExpenses.entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .limit(5)
                .forEach(e -> patterns.append(String.format("- %s: ₹%.2f\n", e.getKey(), e.getValue())));
        }
        
        return patterns.toString();
    }

    private String getPerformanceAnalysis(String userId) {
        StringBuilder analysis = new StringBuilder();
        
        // Stock performance
        List<Stock> stocks = stockRepository.findByUserId(userId);
        if (!stocks.isEmpty()) {
            analysis.append("Stock Performance:\n");
            for (Stock stock : stocks) {
                double invested = stock.getQuantity() * stock.getPurchasePrice();
                double current = stock.getQuantity() * stock.getCurrentPrice();
                double returns = ((current - invested) / invested) * 100;
                analysis.append(String.format("- %s: %.2f%% returns (₹%.2f → ₹%.2f)\n", 
                    stock.getStockName(), returns, invested, current));
            }
        }
        
        // Mutual fund performance
        List<MutualFund> mutualFunds = mutualFundRepository.findByUserId(userId);
        if (!mutualFunds.isEmpty()) {
            analysis.append("\nMutual Fund Performance:\n");
            for (MutualFund mf : mutualFunds) {
                double invested = mf.getUnits() * mf.getPurchaseNav();
                double current = mf.getUnits() * mf.getCurrentNav();
                double returns = ((current - invested) / invested) * 100;
                analysis.append(String.format("- %s: %.2f%% returns (₹%.2f → ₹%.2f)\n", 
                    mf.getFundName(), returns, invested, current));
            }
        }
        
        // Overall returns
        double totalInvested = 0;
        double totalCurrent = 0;
        
        for (Stock s : stocks) {
            totalInvested += s.getQuantity() * s.getPurchasePrice();
            totalCurrent += s.getQuantity() * s.getCurrentPrice();
        }
        
        for (MutualFund mf : mutualFunds) {
            totalInvested += mf.getUnits() * mf.getPurchaseNav();
            totalCurrent += mf.getUnits() * mf.getCurrentNav();
        }
        
        if (totalInvested > 0) {
            double overallReturns = ((totalCurrent - totalInvested) / totalInvested) * 100;
            analysis.append(String.format("\nOverall Investment Returns: %.2f%%\n", overallReturns));
            analysis.append(String.format("Total Gains/Loss: ₹%.2f\n", totalCurrent - totalInvested));
        }
        
        return analysis.toString();
    }
}
