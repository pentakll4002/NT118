namespace Backend.Contracts;

using Backend.Models;

public record ChatMessageDto(long Id, long SenderId, long ReceiverId, string? Content, string? AttachmentUrl, MessageType MessageType, bool IsRead, System.DateTime SentAt, long? OrderId);
