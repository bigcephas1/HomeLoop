"use client";

export default function CredibilityScore({ score, showDetails = false }) {
  const getScoreColor = () => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getScoreLabel = () => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Improvement";
  };

  const getRecommendations = () => {
    if (score < 40) {
      return "Add verification documents and complete more jobs to improve your score.";
    }
    if (score < 60) {
      return "Add more documents and maintain good ratings to increase your score.";
    }
    if (score < 80) {
      return "Great work! Keep providing quality service to maintain your score.";
    }
    return "Excellent credibility! You're a trusted provider on our platform.";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-500">Credibility Score</h3>
        <span className={`px-2 py-1 text-xs rounded-full text-white ${getScoreColor()}`}>
          {getScoreLabel()}
        </span>
      </div>
      
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block text-blue-600">
              {score}%
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
          <div
            style={{ width: `${score}%` }}
            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${getScoreColor()}`}
          ></div>
        </div>
      </div>

      {showDetails && (
        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {getRecommendations()}
          </p>
          <div className="mt-2 text-xs text-gray-500">
            <p>✓ Verified documents increase score</p>
            <p>✓ Completed jobs boost credibility</p>
            <p>✓ Good ratings improve trust score</p>
          </div>
        </div>
      )}
    </div>
  );
}
