namespace Backend.Contracts;

using System.ComponentModel.DataAnnotations;

public record UpdateReviewRequest(
    [property: Range(1, 5)] int Rating,
    [property: MaxLength(2000)] string? Comment
);

public record ReviewDto(
    long Id,
    long OrderId,
    long ProductId,
    long ReviewerId,
    string ReviewerName,
    string? ReviewerAvatar,
    int Rating,
    string? Comment,
    bool IsVerified,
    int HelpfulVotes,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record ProductReviewsResponse(
    long ProductId,
    decimal AverageRating,
    int TotalReviews,
    List<ReviewDto> Reviews
);

public record OrderReviewStatusResponse(
    long OrderId,
    bool CanReview,
    bool AlreadyReviewed,
    long? ExistingReviewId
);
