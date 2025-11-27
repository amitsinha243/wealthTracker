package com.wealthtracker.controller;

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
@CrossOrigin(origins = "*")
public class AIAssistantController {
    
    private final AIAssistantService aiAssistantService;

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
}
