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
    private String otherMemberNickname;
    private String lastMessage;

    public ChatRoomResponse(ChatRoom chatRoom, String otherMemberNickname, String lastMessage) {
        this.id = chatRoom.getId();
        this.roomName = chatRoom.getRoomName();
        this.participants = chatRoom.getParticipants();
        this.otherMemberNickname = otherMemberNickname;
        this.lastMessage = lastMessage;
    }

    public ChatRoomResponse(ChatRoom chatRoom) {
        this.id = chatRoom.getId();
        this.roomName = chatRoom.getRoomName();
        this.participants = chatRoom.getParticipants();
        this.otherMemberNickname = null;
        this.lastMessage = null;
    }
}
