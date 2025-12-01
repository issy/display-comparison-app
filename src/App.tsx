import {useCallback, useState} from "react";
import useScreenListControl from "./lib/useScreenListControl";
import calculateDimensions from "./lib/calculateDimensions";

const SCALE_FACTOR = 10;

function App() {
  const {state, addDisplay, removeDisplay, updateDisplayInfo, reset} = useScreenListControl();
  const [resultRows, setResultRows] = useState<Array<{
    id: number,
    colour: string,
    diagonal: number,
    width: number,
    height: number,
    area: number
  }>>([]);

  const calculateResults = useCallback(() => {
    setResultRows(state.displays.map((display, index) => {
      const [width, height] = calculateDimensions(display.diagonalSize, display.aspectRatio);
      return {
        id: index + 1,
        colour: display.colour,
        diagonal: display.diagonalSize,
        width,
        height,
        area: width * height
      };
    }))
  }, [state.displays]);

  return (
      <div className="min-h-screen flex flex-col items-center justify-start py-8 px-4">

        <div className="w-full max-w-5xl bg-white p-8 shadow-2xl rounded-xl border border-gray-100">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-2 text-center">Dynamic Screen
            Comparator</h1>
          <p className="text-gray-600 mb-8 text-center">Add screens below to compare different
            diagonal sizes and aspect ratios.</p>

          {/* Dynamic Controls */}
          <div id="screenControls" className="flex justify-center gap-4 mb-4">
            <button id="addScreenButton" onClick={addDisplay}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition duration-200 shadow-md flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20"
                   fill="currentColor">
                <path fill-rule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clip-rule="evenodd"/>
              </svg>
              Add Screen
            </button>
          </div>

          {/* Dynamic Input Fields Container */}
          <div id="screenInputsContainer"
               className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Screen input cards will be generated here by JavaScript */}
          </div>

          <button
              onClick={calculateResults}
              className="w-full bg-indigo-600 text-white p-4 rounded-lg font-bold text-lg hover:bg-indigo-700 transition duration-200 shadow-xl shadow-indigo-300"
          >
            Calculate & Update Comparison
          </button>

          <p id="errorMsg" className="text-red-600 text-sm mt-4 text-center hidden"></p>

          {/* Visual Comparison Area */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Visual Comparison (1 inch =
              ${SCALE_FACTOR}
              pixels)</h2>
            <div className="comparison-container">
              {/* Screen boxes will be generated here by JavaScript */}
            </div>
          </div>

          {/* Results Display */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Calculated Dimensions</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 shadow-lg rounded-lg">
                <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Screen</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagonal
                    (in)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Width
                    (X, in)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Height
                    (Y, in)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area
                    (sq in)
                  </th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {resultRows.map((result, index) => <tr
                    key={index}
                    className={`hover:bg-gray-50 border-l-solid border-l-4 border-l-[${result.colour}]`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Screen
                    ${result.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${result.diagonal.toFixed(1)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">${result.width.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">${result.height.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">${result.area.toFixed(2)}</td>
                </tr>)}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
  )
}

export default App
