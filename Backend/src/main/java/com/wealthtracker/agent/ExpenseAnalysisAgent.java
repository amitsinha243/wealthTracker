package com.wealthtracker.agent;

import com.wealthtracker.model.Expense;
import com.wealthtracker.model.Income;
import com.wealthtracker.repository.ExpenseRepository;
import com.wealthtracker.repository.IncomeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Expense Analysis Agent
 * Analyses income vs expenses, spending categories, trends, and savings rate.
 * Returns a structured markdown report.
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class ExpenseAnalysisAgent {

    private final ChatModel chatModel;
    private final ExpenseRepository expenseRepository;
    private final IncomeRepository incomeRepository;

    public String analyze(String userId) {
        try {
            String expenseData = buildExpenseData(userId);
            String systemPrompt = """
                    You are an expert personal finance analyst specializing in expense tracking and budgeting.
                    You will receive expense and income data and must return a well-structured markdown report
                    with the following sections:
                    
                    ## Expense Summary
                    - Total income, total expenses, net savings
                    - Savings rate (%)
                    
                    ## Monthly Spend Trend
                    - Month-by-month breakdown for the last 6 months
                    - Trend direction (increasing/decreasing/stable)
                    
                    ## Top Expense Categories
                    - Top 5 categories ranked by spend
                    - % of total spend for each
                    
                    ## Spending Alerts
                    - Any months/categories showing unusually high spend
                    - Income vs expense ratio warnings if applicable
                    
                    ## Key Insights
                    - 3-4 actionable bullet points to improve financial health
                    
                    Use Indian Rupee (₹) formatting. Be concise and practical.
                    """;

            Prompt prompt = new Prompt(List.of(
                    new SystemMessage(systemPrompt),
                    new UserMessage("Analyze this expense and income data:\n\n" + expenseData)
            ));

            return chatModel.call(prompt).getResult().getOutput().getContent();
        } catch (Exception e) {
            log.error("Error in ExpenseAnalysisAgent: ", e);
            return "Unable to generate expense analysis at this time. Please try again.";
        }
    }

    private String buildExpenseData(String userId) {
        StringBuilder data = new StringBuilder();

        List<Expense> expenses = expenseRepository.findByUserId(userId);
        List<Income> incomes = incomeRepository.findByUserId(userId);

        // Totals
        double totalExpenses = expenses.stream().mapToDouble(Expense::getAmount).sum();
        double totalIncome = incomes.stream().mapToDouble(Income::getAmount).sum();
        double netSavings = totalIncome - totalExpenses;
        double savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

        data.append(String.format("Total Income (all time): ₹%.2f\n", totalIncome));
        data.append(String.format("Total Expenses (all time): ₹%.2f\n", totalExpenses));
        data.append(String.format("Net Savings: ₹%.2f\n", netSavings));
        data.append(String.format("Overall Savings Rate: %.1f%%\n\n", savingsRate));

        // Monthly expense breakdown (last 6 months)
        LocalDate sixMonthsAgo = LocalDate.now().minusMonths(6);
        Map<String, Double> monthlyExpenses = expenses.stream()
                .filter(e -> e.getDate() != null && e.getDate().isAfter(sixMonthsAgo))
                .collect(Collectors.groupingBy(
                        e -> e.getDate().toString().substring(0, 7),
                        Collectors.summingDouble(Expense::getAmount)));

        data.append("=== MONTHLY EXPENSES (last 6 months) ===\n");
        monthlyExpenses.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .forEach(e -> data.append(String.format("- %s: ₹%.2f\n", e.getKey(), e.getValue())));
        data.append("\n");

        // Monthly income breakdown (last 6 months)
        Map<String, Double> monthlyIncome = incomes.stream()
                .filter(i -> i.getDate() != null && i.getDate().isAfter(sixMonthsAgo))
                .collect(Collectors.groupingBy(
                        i -> i.getDate().toString().substring(0, 7),
                        Collectors.summingDouble(Income::getAmount)));

        data.append("=== MONTHLY INCOME (last 6 months) ===\n");
        monthlyIncome.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .forEach(e -> data.append(String.format("- %s: ₹%.2f\n", e.getKey(), e.getValue())));
        data.append("\n");

        // Category breakdown
        Map<String, Double> categoryExpenses = expenses.stream()
                .collect(Collectors.groupingBy(
                        Expense::getCategory,
                        Collectors.summingDouble(Expense::getAmount)));

        data.append("=== EXPENSE CATEGORIES (all time) ===\n");
        categoryExpenses.entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .forEach(e -> data.append(String.format("- %s: ₹%.2f (%.1f%% of total)\n",
                        e.getKey(), e.getValue(),
                        totalExpenses > 0 ? (e.getValue() / totalExpenses) * 100 : 0)));

        return data.toString();
    }
}
