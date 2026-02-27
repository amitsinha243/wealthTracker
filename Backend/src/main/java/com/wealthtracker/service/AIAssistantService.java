package com.wealthtracker.service;

import com.wealthtracker.agent.AIOrchestrator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * AIAssistantService — thin facade that delegates to the AIOrchestrator.
 * Kept for backward compatibility; all logic now lives in the agent package.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class AIAssistantService {

    private final AIOrchestrator aiOrchestrator;

    public String chat(String userMessage, String userId) {
        return aiOrchestrator.chat(userMessage, userId);
    }
}
