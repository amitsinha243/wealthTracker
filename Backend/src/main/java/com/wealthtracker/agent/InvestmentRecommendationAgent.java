package com.wealthtracker.agent;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Investment Recommendation Agent
 * Takes the outputs of InvestmentAnalysisAgent and ExpenseAnalysisAgent
 * and produces personalized, actionable investment recommendations.
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class InvestmentRecommendationAgent {

    private final ChatModel chatModel;

    public String recommend(String portfolioReport, String expenseReport) {
        try {
            String systemPrompt = """
                    You are a seasoned financial advisor with expertise in Indian markets (NSE/BSE, mutual funds, FDs, PPF, NPS).
                    You will receive a portfolio analysis report and an expense analysis report.
                    Based on both, generate a personalized investment recommendation report with these sections:
                    
                    ## Risk Profile
                    - Classify the investor as: Conservative / Moderate / Aggressive
                    - Brief justification based on their current allocation and spending
                    
                    ## Recommended Asset Allocation
                    - Suggest an optimal target allocation (%) across Stocks, Mutual Funds, FDs, and Savings
                    - Explain why this target allocation suits their profile
                    
                    ## Top Investment Suggestions
                    Provide 3-5 concrete, actionable suggestions. For each:
                    - What to invest in (specific category, type, or Indian fund/instrument)
                    - Why it suits this investor
                    - Approximate expected return or benefit
                    
                    ## Rebalancing Actions
                    - What to increase, decrease, or maintain
                    - Priority order for the next 3 months
                    
                    ## Savings Optimization
                    - Based on the expense data, suggest how to free up more money to invest
                    - 2-3 specific spending areas to reduce
                    
                    Be specific, practical, and focused on Indian financial instruments. Use ₹ currency.
                    Avoid generic advice — tailor everything to the data provided.
                    """;

            String userContent = "PORTFOLIO ANALYSIS:\n" + portfolioReport
                    + "\n\n---\n\nEXPENSE ANALYSIS:\n" + expenseReport
                    + "\n\n---\n\nGenerate personalized investment recommendations based on the above data.";

            Prompt prompt = new Prompt(List.of(
                    new SystemMessage(systemPrompt),
                    new UserMessage(userContent)
            ));

            return chatModel.call(prompt).getResult().getOutput().getContent();
        } catch (Exception e) {
            log.error("Error in InvestmentRecommendationAgent: ", e);
            return "Unable to generate investment recommendations at this time. Please try again.";
        }
    }
}
