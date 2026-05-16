import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { BiLeftArrowCircle } from "react-icons/bi";
import { SubmissionAnswers } from "./SubmissionAnswers";

// Submission Viewer Component (same as before - no changes needed)
interface SubmissionViewerProps {
  isOpen: boolean;
  onClose: () => void;
  submission: any;
  task: any;
}

const SubmissionViewer = ({ isOpen, onClose, submission, task }: SubmissionViewerProps) => {
  if (!isOpen || !submission) return null;

  const [viewSubmissionAnswers, setViewSubmissionAnswers] = useState(false);

  const correctAnswers = submission.taskResult?.answers?.filter((answer: any) => answer.isCorrect).length || 0;
  const wrongAnswers = submission.totalQuestions - correctAnswers;

  return (
    <div className="bg-white rounded-lg">
      {viewSubmissionAnswers ? (
        <SubmissionAnswers
          isOpen={viewSubmissionAnswers}
          onClose={() => setViewSubmissionAnswers(false)}
          task={{
            ...submission,
            answers: submission.taskResult?.answers || []
          }}
        />
      ) : (
        <>
          {/* Header with back arrow and title */}
          <div className="flex items-center gap-3 p-4">
            <button
              onClick={onClose}
              className="p-1 hover:bg-blue-100 rounded-full transition-colors"
            >
              <BiLeftArrowCircle size={25} />
            </button>
            <h2 className="text-lg font-semibold text-gray-800">{submission?.name}'s Submission</h2>
          </div>

          {/* Score Overview Card */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-4 mb-4">
              <img
                src={submission?.image || "/avatar2.png"}
                alt={submission?.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div>
                <h3 className="font-medium text-gray-800">{submission?.name}'s Submission</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  submission.taskResult?.evaluationStatus === 'completed' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {submission.taskResult?.evaluationStatus === 'completed' ? 'Evaluated' : 'Pending Evaluation'}
                </span>
                
              </div>
            </div>

            {/* Circular Progress and Stats */}
            <div className="flex items-center justify-between rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-4">
                {/* Circular Progress */}
                <div className="relative">
                  <svg className="w-30 h-30 transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="35" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                    <circle
                      cx="50" cy="50" r="35" stroke="#3b82f6" strokeWidth="8" fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${(correctAnswers / submission.totalQuestions) * 220} 220`}
                      className="transition-all duration-300 ease-in-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col justify-center items-center text-xs text-blue-600 font-bold leading-tight">
                    <span className="text-xs text-gray-500">Total Score</span>
                    <span className="text-lg font-bold">{submission.taskResult?.score || correctAnswers}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-gray-800 rounded-full"></span>
                    <span className="text-gray-600">Correct Answers</span>
                    <span className="font-bold text-gray-800">{correctAnswers}/{submission.totalQuestions}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                    <span className="text-gray-600">Wrong Answers</span>
                    <span className="font-bold text-gray-800">{wrongAnswers}/{submission.totalQuestions}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Questions List */}
          <div className="flex items-center justify-center text-center p-5">
            <button 
              onClick={() => {
                console.log(submission.taskResult?.answers);
                setViewSubmissionAnswers(true);
              }} 
              className="px-3 py-1 hover:bg-gray-200 cursor-pointer text-xs border text-blue-600 border-blue-700 rounded-md transition-colors"
              disabled={!submission.taskResult?.answers}
            >
              View Submission Answers
            </button>
          </div>
        </>
      )}
    </div>
  );
};

interface TaskStatsPanelProps {
  selectedtask: any;
  taskResult: any;
}

export function TaskStatsPanel({ selectedtask, taskResult }: TaskStatsPanelProps) {
  const [viewSubmission, setViewSubmission] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);

  if (!selectedtask) return null;

  useEffect(() => {
    console.log("Selected task in TaskStatsPanel:", selectedtask);
    console.log("Task result data:", taskResult);
  }, [selectedtask, taskResult]);

  const totalQuestions = selectedtask?.totalquestions ?? 0;
  const avgScore = taskResult?.metrics?.avgScore ?? "-";
  const minScore = taskResult?.metrics?.minScore ?? "-";
  const maxScore = taskResult?.metrics?.maxScore ?? "-";
  const totalSubmissions = taskResult?.metrics?.totalSubmissions ?? "-";
  const completedSubmissions = taskResult?.metrics?.completedSubmissions ?? "-";
  const pendingSubmissions = taskResult?.metrics?.pendingSubmissions ?? "-";
  const commonMistakes = taskResult?.metrics?.commonMistakes ?? "-";
  const accuracyRate = taskResult?.metrics?.accuracyRate ?? "-";

  // Combine submitted and not submitted students for display
  const allStudents = [
    ...(taskResult?.submission?.submitted || []).map((student: any) => ({
      ...student,
      hasSubmission: true,
      status: student.taskResult?.evaluationStatus || 'pending'
    })),
    ...(taskResult?.submission?.notSubmitted || []).map((student: any) => ({
      ...student,
      hasSubmission: false,
      taskResult: null,
      status: 'not_submitted'
    }))
  ];

  const handleViewSubmission = (submissionData: any) => {
    const submission = {
      _id: submissionData._id,
      name: submissionData.name,
      image: submissionData.image,
      totalQuestions: totalQuestions,
      taskResult: submissionData.taskResult
    };
    console.log("Selected submission:", submission);
    setSelectedSubmission(submission);
    setViewSubmission(true);
  };

  return (
    <>
      {viewSubmission ? (
        <SubmissionViewer
          isOpen={viewSubmission}
          onClose={() => {
            setViewSubmission(false);
            setSelectedSubmission(null);
          }}
          submission={selectedSubmission}
          task={selectedtask}
        />
      ) : (
        <>
          {/* Header */}
          <div className="flex justify-between items-center bg-[#EDF1FF] p-3 rounded-xl">
            <h3 className="font-bold text-sm text-[#2C2F5A]">
              {selectedtask?.topic}
              <span className="text-xs font-normal text-gray-500"> ({totalQuestions} Questions)</span>
            </h3>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 px-1 text-sm font-medium text-[#2C2F5A]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-black rounded-full" />
              Avg. Score <span className="font-bold ml-1">{avgScore}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-gray-300 rounded-full" />
              Max. Score <span className="font-bold ml-1">{maxScore}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
              Total Submissions <span className="font-bold ml-1">{totalSubmissions}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              Completed <span className="font-bold ml-1">{completedSubmissions}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full" />
              Pending <span className="font-bold ml-1">{pendingSubmissions}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full" />
              Common Mistakes <span className="font-bold ml-1">{commonMistakes}</span>
            </div> 
          </div>

          {/* Submissions Header */}
          <div className="flex justify-between items-center mt-2">
            <h4 className="text-sm font-bold text-[#2C2F5A]">All Students</h4>
          </div>

          {/* Submissions List */}
          <div className="flex flex-col gap-3 pb-2 max-h-[300px] overflow-y-auto">
            {allStudents && allStudents.length > 0 ? (
              allStudents.map((student: any) => {
                const hasSubmission = student.hasSubmission;
                const isCompleted = student.status === 'completed';
                const isPending = student.status === 'pending';
                
                return (
                  <div
                    key={student._id}
                    className={`flex items-center justify-between px-3 py-2 rounded-full ${
                      hasSubmission ? "bg-[#EDF1FF]" : "bg-[#F2F2F2]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={student?.image ?? "/avatar2.png"}
                        alt={student?.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-[#2C2F5A]">
                          {student?.name}
                        </span>
                        {hasSubmission && (
                          <span className="text-xs text-gray-500">
                            Score: {student.taskResult?.score || '-'} | 
                            {isPending ? ' Pending' : isCompleted ? ' Evaluated' : ' Unknown'}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => hasSubmission && handleViewSubmission(student)}
                      className={`text-xs font-semibold px-3 py-1 rounded-full border transition ${
                        hasSubmission
                          ? "text-[#0047FF] border-[#0047FF] bg-white hover:bg-[#EAF0FF] cursor-pointer"
                          : "text-gray-500 border-gray-300 bg-white cursor-not-allowed"
                      }`}
                      disabled={!hasSubmission}
                    >
                      {hasSubmission ? "View Submission" : "No Submission"}
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-500">No students found</p>
            )}
          </div>
        </>
      )}
    </>
  );
}