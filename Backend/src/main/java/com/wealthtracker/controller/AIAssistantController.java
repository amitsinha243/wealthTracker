package com.wealthtracker.controller;

import com.wealthtracker.agent.AIOrchestrator;
import com.wealthtracker.dto.AgentReportResponse;
import com.wealthtracker.dto.ChatMessage;
import com.wealthtracker.dto.ChatResponse;
import com.wealthtracker.service.AIAssistantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(
        origins = {"http://localhost:5173", "https://amitsinha243.github.io/wealthTracker"},
        allowCredentials = "true"
)
public class AIAssistantController {

    private final AIAssistantService aiAssistantService;
    private final AIOrchestrator aiOrchestrator;

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(
            @RequestBody ChatMessage chatMessage,
            Authentication authentication) {

        try {
            String userId = authentication.getName();
            log.info("AI chat request from user: {}, message: {}", userId, chatMessage.getMessage());

            String response = aiAssistantService.chat(chatMessage.getMessage(), userId);
            return ResponseEntity.ok(new ChatResponse(response));

        } catch (Exception e) {
            log.error("Error processing AI chat: ", e);
            return ResponseEntity.internalServerError()
                .body(new ChatResponse("Sorry, I encountered an error. Please try again."));
        }
    }

    @GetMapping("/portfolio-analysis")
    public ResponseEntity<AgentReportResponse> portfolioAnalysis(Authentication authentication) {
        try {
            String userId = authentication.getName();
            log.info("Portfolio analysis requested by user: {}", userId);
            String report = aiOrchestrator.analyzePortfolio(userId);
            return ResponseEntity.ok(new AgentReportResponse("InvestmentAnalysisAgent", report));
        } catch (Exception e) {
            log.error("Error in portfolio analysis: ", e);
            return ResponseEntity.internalServerError()
                .body(new AgentReportResponse("InvestmentAnalysisAgent", "Unable to generate report. Please try again."));
        }
    }

    @GetMapping("/expense-analysis")
    public ResponseEntity<AgentReportResponse> expenseAnalysis(Authentication authentication) {
        try {
            String userId = authentication.getName();
            log.info("Expense analysis requested by user: {}", userId);
            String report = aiOrchestrator.analyzeExpenses(userId);
            return ResponseEntity.ok(new AgentReportResponse("ExpenseAnalysisAgent", report));
        } catch (Exception e) {
            log.error("Error in expense analysis: ", e);
            return ResponseEntity.internalServerError()
                .body(new AgentReportResponse("ExpenseAnalysisAgent", "Unable to generate report. Please try again."));
        }
    }

    @GetMapping("/recommendations")
    public ResponseEntity<AgentReportResponse> recommendations(Authentication authentication) {
        try {
            String userId = authentication.getName();
            log.info("Investment recommendations requested by user: {}", userId);
            String report = aiOrchestrator.generateRecommendations(userId);
            return ResponseEntity.ok(new AgentReportResponse("InvestmentRecommendationAgent", report));
        } catch (Exception e) {
            log.error("Error in recommendations: ", e);
            return ResponseEntity.internalServerError()
                .body(new AgentReportResponse("InvestmentRecommendationAgent", "Unable to generate recommendations. Please try again."));
        }
    }
}
