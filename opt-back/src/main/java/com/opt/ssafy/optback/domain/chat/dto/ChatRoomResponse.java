package com.opt.ssafy.optback.domain.chat.dto;

import com.opt.ssafy.optback.domain.chat.entity.ChatRoom;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoomResponse {

    private String id;
    private String roomName;
    private List<Integer> participants;

    public ChatRoomResponse(ChatRoom chatRoom) {
        this.id = chatRoom.getId();
        this.roomName = chatRoom.getRoomName();
        this.participants = chatRoom.getParticipants();
    }
}
