import { useEffect, useState } from "react";

interface History {
  q: string;
  a: string;
  correct: boolean;
}

function generateRandomNumber(digits: number = 1): number {
  if (digits < 1) throw new Error("Digit harus minimal 1");
  const max = Math.pow(10, digits) - 1;
  return Math.floor(Math.random() * (max + 1));
}

function App() {
  const [digit, setDigit] = useState(() => {
    const savedDigit = localStorage.getItem("digit");
    return savedDigit ? Number(savedDigit) : 1;
  });
  const [op, setOp] = useState(() => {
    const savedOp = localStorage.getItem("operation");
    return savedOp ? savedOp : "+";
  });
  const [num1, setNum1] = useState(generateRandomNumber(digit));
  const [num2, setNum2] = useState(generateRandomNumber(digit));
  const [answer, setAnswer] = useState<number | "">("");
  const [history, setHistory] = useState<History[]>(() => {
    const savedHistory = localStorage.getItem("history");
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [score, setScore] = useState(() => {
    const savedScore = localStorage.getItem("score");
    return savedScore ? Number(savedScore) : 0;
  });

  const calculateResult = (): boolean => {
    const operations = {
      "+": num1 + num2,
      "-": num1 - num2,
      "*": num1 * num2,
      "/": Math.floor(num1 / num2),
      "%": num1 % num2,
    } as const;

    return operations[op as keyof typeof operations] === Number(answer);
  };

  const sendAnswer = () => {
    if (answer === "") return;

    const isCorrect = calculateResult();

    // Update skor berdasarkan jawaban
    setScore((prev) => {
      const newScore = isCorrect ? prev + 1 : prev - 1;
      localStorage.setItem("score", newScore.toString());
      return newScore;
    });

    // Tambahkan ke history
    const newHistory = [
      ...history,
      { q: `${num1} ${op} ${num2}`, a: `${answer}`, correct: isCorrect },
    ];
    setHistory(newHistory);
    localStorage.setItem("history", JSON.stringify(newHistory));

    // Generate soal baru
    setNum1(generateRandomNumber(digit));
    setNum2(generateRandomNumber(digit));
    setAnswer("");
  };

  const resetGame = () => {
    setScore(0);
    setHistory([]);
    localStorage.removeItem("score");
    localStorage.removeItem("history");
  };

  // Kirim jawaban dengan tombol Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendAnswer();
    }
  };

  // Update soal saat digit diubah
  useEffect(() => {
    setNum1(generateRandomNumber(digit));
    setNum2(generateRandomNumber(digit));
    localStorage.setItem("digit", digit.toString());
  }, [digit]);

  // Simpan operation ke localStorage
  useEffect(() => {
    localStorage.setItem("operation", op);
  }, [op]);

  return (
    <div className="min-h-screen bg-gray-100 p-5 flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="text-2xl font-bold text-gray-800">RellMath</h1>
        <p className="text-lg font-medium text-gray-600">Score: {score}</p>
      </div>

      {/* Reset Button */}
      <button
        onClick={resetGame}
        className="mb-5 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
      >
        Reset Score & History
      </button>

      {/* Settings */}
      <div className="bg-white shadow-lg rounded-lg p-5 mb-5 w-full max-w-lg md:max-w-xl">
        <h2 className="text-xl font-bold mb-4">Settings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Digits Setting */}
          <div>
            <label htmlFor="digit" className="text-sm font-medium">
              Digits
            </label>
            <input
              type="number"
              id="digit"
              min={1}
              value={digit}
              onChange={(e) => setDigit(Number(e.target.value))}
              className="w-full p-2 border rounded-lg focus:outline-blue-500"
            />
          </div>
          {/* Operation Setting */}
          <div>
            <label htmlFor="operation" className="text-sm font-medium">
              Operation
            </label>
            <select
              id="operation"
              value={op}
              onChange={(e) => setOp(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-blue-500"
            >
              {["+", "-", "*", "/", "%"].map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Quiz */}
      <div className="bg-white shadow-lg rounded-lg p-5 mb-5 w-full max-w-lg md:max-w-xl">
        <h2 className="text-xl font-bold mb-3 text-center">
          {num1} {op} {num2}
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <input
            type="number"
            value={answer}
            onChange={(e) => setAnswer(Number((e.target as HTMLInputElement).value))}
            onKeyDown={handleKeyPress} // Trigger Enter key
            className="flex-1 p-2 border rounded-lg focus:outline-blue-500"
          />
          <button
            onClick={sendAnswer}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 w-full sm:w-auto"
          >
            Submit
          </button>
        </div>
      </div>

      {/* History */}
      <div className="bg-white shadow-lg rounded-lg p-5 w-full max-w-lg md:max-w-xl">
        <h2 className="text-xl font-bold mb-3">History</h2>
        <div
          className="flex flex-col gap-2 overflow-y-auto"
          style={{ maxHeight: "40vh" }} // Membatasi tinggi dan menambahkan scroll
        >
          {history.length === 0 && (
            <p className="text-gray-500 text-center">No history yet.</p>
          )}
          {history.map((item, index) => (
            <div
              key={index}
              className={`flex justify-between items-center p-3 rounded-lg ${item.correct ? "bg-green-100" : "bg-red-100"
                }`}
            >
              <span className="text-sm sm:text-base">
                {item.q} = {item.a}
              </span>
              <span className={`font-bold ${item.correct ? "text-green-700" : "text-red-700"}`}>
                {item.correct ? "Correct" : "Wrong"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;