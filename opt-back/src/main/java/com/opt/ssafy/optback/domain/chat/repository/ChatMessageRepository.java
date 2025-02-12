package com.opt.ssafy.optback.domain.chat.repository;

import com.opt.ssafy.optback.domain.chat.entity.ChatMessage;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ChatMessageRepository extends MongoRepository<ChatMessage, Integer> {

    List<ChatMessage> findBySenderIdAndReceiverId(int senderId, int receiverId);
}
