
          {isUnlocked ? (
            <div>
              <p className="text-gray-700">{review.content}</p>
              <div className="mt-2 text-sm text-green-600 flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                Full review unlocked
              </div>
              
              {/* Reactions for unlocked reviews */}
              <div className="mt-4 border-t pt-3">
                <div className="text-sm text-gray-500 mb-1">React to this review:</div>
                <ReviewReactions 
                  reviewId={review.id}
                  customerId={currentUser?.id || ""}
                  reactions={review.reactions || { like: [], funny: [], useful: [], ohNo: [] }}
                  onReactionToggle={onReactionToggle}
                />
              </div>
              
              {/* Customer review responses component - ensure hideReplyOption is set appropriately based on subscription */}
              <CustomerReviewResponse 
                reviewId={review.id}
                responses={review.responses || []}
                hasSubscription={hasSubscription}
                isOneTimeUnlocked={isUnlocked && !hasSubscription}
                hideReplyOption={!hasSubscription} // Hide reply option if no subscription
              />
            </div>
          ) : (
            <div>
              <p className="text-gray-700">{getFirstThreeWords(review.content)}</p>
              <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600">
                    <Lock className="h-4 w-4 mr-2" />
                    <span>Unlock full review for $3</span>
                  </div>
                  <Button 
                    onClick={handlePurchaseClick}
                    size="sm"
                  >
                    Purchase
                  </Button>
                </div>
              </div>
            </div>
          )}
