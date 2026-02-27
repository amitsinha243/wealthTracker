package com.wealthtracker.agent;

import com.wealthtracker.model.*;
import com.wealthtracker.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * AI Orchestrator — central router that delegates to the three specialized agents.
 * Also handles the conversational chat mode (with lightweight context injection).
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class AIOrchestrator {

    private final ChatModel chatModel;
    private final InvestmentAnalysisAgent investmentAnalysisAgent;
    private final ExpenseAnalysisAgent expenseAnalysisAgent;
    private final InvestmentRecommendationAgent investmentRecommendationAgent;

    // Repositories for lightweight chat context
    private final StockRepository stockRepository;
    private final MutualFundRepository mutualFundRepository;
    private final FixedDepositRepository fixedDepositRepository;
    private final SavingsAccountRepository savingsAccountRepository;
    private final ExpenseRepository expenseRepository;
    private final IncomeRepository incomeRepository;

    /**
     * Run the Investment Analysis Agent for a user.
     */
    public String analyzePortfolio(String userId) {
        log.info("Running InvestmentAnalysisAgent for user: {}", userId);
        return investmentAnalysisAgent.analyze(userId);
    }

    /**
     * Run the Expense Analysis Agent for a user.
     */
    public String analyzeExpenses(String userId) {
        log.info("Running ExpenseAnalysisAgent for user: {}", userId);
        return expenseAnalysisAgent.analyze(userId);
    }

    /**
     * Run both analysis agents, then pass their reports to the Recommendation Agent.
     */
    public String generateRecommendations(String userId) {
        log.info("Running full agent pipeline for recommendations, user: {}", userId);
        String portfolioReport = investmentAnalysisAgent.analyze(userId);
        String expenseReport = expenseAnalysisAgent.analyze(userId);
        return investmentRecommendationAgent.recommend(portfolioReport, expenseReport);
    }

    /**
     * Conversational chat — enriches the prompt with a concise financial summary
     * so the user can ask ad-hoc questions about their finances.
     */
    public String chat(String userMessage, String userId) {
        try {
            String context = buildChatContext(userId);
            String systemPrompt = """
                    You are a helpful financial assistant for a personal wealth tracking app.
                    The user's financial summary is provided below. Answer their questions concisely
                    and accurately, using the data provided. Format monetary values with ₹.
                    If you cannot answer something from the data, say so clearly.
                    
                    """ + context;

            Prompt prompt = new Prompt(List.of(
                    new SystemMessage(systemPrompt),
                    new UserMessage(userMessage)
            ));

            return chatModel.call(prompt).getResult().getOutput().getContent();
        } catch (Exception e) {
            log.error("Error in AIOrchestrator.chat: ", e);
            return "I'm sorry, I encountered an error. Please try again.";
        }
    }

    private String buildChatContext(String userId) {
        StringBuilder ctx = new StringBuilder("USER FINANCIAL SNAPSHOT:\n");

        List<Stock> stocks = stockRepository.findByUserId(userId);
        double stockVal = stocks.stream().mapToDouble(s -> s.getQuantity() * s.getPurchasePrice()).sum();
        ctx.append(String.format("- Stocks: ₹%.0f (%d holdings)\n", stockVal, stocks.size()));

        List<MutualFund> mfs = mutualFundRepository.findByUserId(userId);
        double mfVal = mfs.stream().mapToDouble(mf -> mf.getUnits() * mf.getNav()).sum();
        ctx.append(String.format("- Mutual Funds: ₹%.0f (%d funds)\n", mfVal, mfs.size()));

        List<FixedDeposit> fds = fixedDepositRepository.findByUserId(userId);
        double fdVal = fds.stream().mapToDouble(FixedDeposit::getAmount).sum();
        ctx.append(String.format("- Fixed Deposits: ₹%.0f (%d deposits)\n", fdVal, fds.size()));

        List<SavingsAccount> savings = savingsAccountRepository.findByUserId(userId);
        double savVal = savings.stream().mapToDouble(SavingsAccount::getBalance).sum();
        ctx.append(String.format("- Savings: ₹%.0f (%d accounts)\n", savVal, savings.size()));

        ctx.append(String.format("- Total Portfolio: ₹%.0f\n", stockVal + mfVal + fdVal + savVal));

        double totalExpenses = expenseRepository.findByUserId(userId)
                .stream().mapToDouble(Expense::getAmount).sum();
        double totalIncome = incomeRepository.findByUserId(userId)
                .stream().mapToDouble(Income::getAmount).sum();

        ctx.append(String.format("- Total Income: ₹%.0f | Total Expenses: ₹%.0f | Net Savings: ₹%.0f\n",
                totalIncome, totalExpenses, totalIncome - totalExpenses));

        return ctx.toString();
    }
}
