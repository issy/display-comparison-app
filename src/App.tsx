import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {useForm, useFieldArray, Controller, type UseFormReturn, type FieldValues} from 'react-hook-form';

// --- Type Definitions ---

// Defines the structure of a single screen's input data
interface ScreenData {
  diagonal: number;
  ratio: number;
  color: string; // Hex code
}

// Defines the structure of the overall form values
interface FormValues extends FieldValues {
  screens: ScreenData[];
}

// Defines the calculated dimensions and area
interface CalculatedDimensions {
  width: number;
  height: number;
  area: number;
}

// Defines the combined screen data after calculation (includes RHF ID)
interface CalculatedScreen extends ScreenData, CalculatedDimensions {
  id: string; // RHF uses 'id' string for fields
}

// Scale factor for visual display: 1 inch = 10 pixels
const SCALE_FACTOR = 10;

// Helper function to calculate screen dimensions (Width/Height)
const calculateDimensions = (diagonal: number, aspectRatio: number): CalculatedDimensions => {
  // Basic validation is handled by RHF rules, but internal calculation needs guard
  if (diagonal <= 0 || aspectRatio <= 0) {
    return {width: 0, height: 0, area: 0};
  }

  // Calculation based on Pythagorean theorem (D^2 = x^2 + y^2) and Ratio (R = x/y)
  const R_squared = aspectRatio * aspectRatio;
  const denominator = Math.sqrt(R_squared + 1);

  const height = diagonal / denominator;
  const width = aspectRatio * height;
  const area = width * height;

  return {width, height, area};
};

const colourPalette: string[] = ['amber-500', 'emerald-500', 'red-500', 'blue-500', 'violet-500', 'orange-500', 'purple-500', 'indigo-500'];

const getNextColor = (currentLength: number): string => {
  return colourPalette[currentLength % colourPalette.length];
};

const defaultScreens: ScreenData[] = [{
  diagonal: 27,
  ratio: 1.7777777777777777,
  color: getNextColor(0)
}, {diagonal: 32, ratio: 2.3333333333333335, color: getNextColor(1)}];

// --- Sub-Components ---

interface ScreenInputCardProps {
  control: UseFormReturn<FormValues>['control'];
  index: number;
  remove: (index?: number | number[]) => void;
  screenCount: number;
  field: FormValues['screens'][number] & { id: string };
  updateComparison: () => void;
  watch: UseFormReturn<FormValues>['watch'];
}

// Component for a single screen input card, integrated with react-hook-form
const ScreenInputCard: React.FC<ScreenInputCardProps> = ({
   control,
   index,
   remove,
   screenCount,
   field,
   updateComparison,
   watch
}) => {
  // Use watch to get the current screen color for card styling
  const screenData = watch(`screens.${index}`);
  const screenColor = screenData ? screenData.color : field.color;

  // Custom validation rule for positive numbers
  const positiveNumber = {
    valueAsNumber: true,
    required: 'Value is required',
    min: {value: 0.1, message: 'Must be a positive number (> 0)'}
  };

  return (<div
      className="p-4 rounded-xl shadow-lg border"
      style={{borderColor: `${screenColor}40`, backgroundColor: `${screenColor}10`}}
  >
    <div className="flex justify-between items-center mb-4">
      <h3 className="font-bold text-xl" style={{color: screenColor}}>Screen {index + 1}</h3>
      {screenCount > 1 && (<button
          onClick={() => {
            remove(index);
            updateComparison();
          }}
          className="text-gray-500 hover:text-red-600 transition duration-150"
          type="button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20"
             fill="currentColor">
          <path fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"/>
        </svg>
      </button>)}
    </div>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1"
               htmlFor={`screens[${index}].diagonal`}>Diagonal (in)</label>
        <Controller
            name={`screens.${index}.diagonal` as const}
            control={control}
            rules={positiveNumber}
            render={({field, fieldState: {error}}) => (<>
              <input
                  {...field}
                  type="number"
                  step="any"
                  className={`w-full p-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ${error ? 'border-red-500' : 'border-gray-300'}`}
                  onBlur={() => updateComparison()} // Trigger calculation on blur
              />
              {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
            </>)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1"
               htmlFor={`screens[${index}].ratio`}>Ratio (X/Y)</label>
        <Controller
            name={`screens.${index}.ratio` as const}
            control={control}
            rules={positiveNumber}
            render={({field, fieldState: {error}}) => (<>
              <input
                  {...field}
                  type="number"
                  step="any"
                  className={`w-full p-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ${error ? 'border-red-500' : 'border-gray-300'}`}
                  onBlur={() => updateComparison()} // Trigger calculation on blur
              />
              {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
            </>)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1"
               htmlFor={`screens[${index}].color`}>Outline Color</label>
        <Controller
            name={`screens.${index}.color` as const}
            control={control}
            render={({field}) => (<input
                {...field}
                type="color"
                className="w-full h-10 p-1 border rounded-lg cursor-pointer"
                onChange={(e) => {
                  field.onChange(e);
                  updateComparison();
                }}
            />)}
        />
      </div>
    </div>
  </div>);
};

interface ResultRowProps {
  screen: CalculatedScreen;
  index: number;
}

const ResultRow: React.FC<ResultRowProps> = ({screen, index}) => (
    <tr className="hover:bg-gray-50" style={{borderLeft: `4px solid ${screen.color}`}}>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Screen {index + 1}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{screen.diagonal.toFixed(1)}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">{screen.width.toFixed(2)}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">{screen.height.toFixed(2)}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">{screen.area.toFixed(2)}</td>
    </tr>);

// --- Main Component ---
const App: React.FC = () => {
  // 1. Initialize useForm with FormValues type
  const {control, watch, getValues, formState: {errors}} = useForm<FormValues>({
    defaultValues: {screens: defaultScreens}, mode: "onBlur"
  });

  // 2. Initialize useFieldArray for dynamic screen list
  const {fields, append, remove} = useFieldArray({
    control, name: "screens",
  });

  // State for calculated data
  const [calculatedScreens, setCalculatedScreens] = useState<CalculatedScreen[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');

  /**
   * Core logic to calculate dimensions and update the results state.
   */
  const updateComparison = useCallback(() => {
    // Read form values (which are typed as FormValues)
    const currentScreens = getValues('screens');
    const results: CalculatedScreen[] = [];
    let hasError = false;

    // Check for RHF validation errors first
    if (Object.keys(errors).length > 0) {
      setErrorMsg("Please correct the input errors (highlighted in red).");
      setCalculatedScreens([]);
      return;
    }

    // Perform calculation on all screens
    currentScreens.forEach((screen, index) => {
      const {diagonal, ratio} = screen;

      // Check for potential runtime issues (though RHF validation should prevent most)
      if (isNaN(diagonal) || isNaN(ratio) || diagonal <= 0 || ratio <= 0) {
        hasError = true;
      }

      const dims = calculateDimensions(diagonal, ratio);

      // Map RHF's internal ID for the key prop in rendering
      results.push({...screen, ...dims, id: fields[index].id});
    });

    if (hasError) {
      setErrorMsg("Please ensure all screens have valid, positive diagonal and ratio values.");
      setCalculatedScreens([]);
    } else {
      setErrorMsg('');
      setCalculatedScreens(results);
    }
  }, [getValues, errors, fields]);


  // Run calculation on initial load and when RHF fields change
  useEffect(() => {
    // Watch for changes across the entire 'screens' array
    const subscription = watch(() => {
      // Delay running the comparison slightly to allow RHF validation to catch up
      setTimeout(() => updateComparison(), 50);
    });
    return () => subscription.unsubscribe();
  }, [watch, updateComparison]);


  const addScreen = (): void => {
    if (fields.length >= 6) {
      setErrorMsg("Maximum of 6 screens allowed for comparison.");
      return;
    }
    setErrorMsg('');

    const newScreen: ScreenData = {
      diagonal: 24, ratio: 1.7777777777777777, color: getNextColor(fields.length)
    };
    append(newScreen);
  };

  // --- JSX Render Helpers ---

  const ScreenBox = useMemo(() => calculatedScreens.map((screen, index) => (<div
      key={screen.id}
      className="screen-box"
      style={{
        width: `${screen.width * SCALE_FACTOR}px`,
        height: `${screen.height * SCALE_FACTOR}px`,
        borderColor: screen.color,
        backgroundColor: `${screen.color}20`,
        borderStyle: 'solid',
        zIndex: index + 1, // Stack order
      }}
  />)), [calculatedScreens]);


  return (
      <div className="min-h-screen flex flex-col items-center justify-start py-8 px-4 bg-f7f9fb">
        <style>
          {/* Custom styles for a cleaner look */}
          {'body { font-family: "Inter", sans-serif; background-color: #f7f9fb; }'}

          {/* Style for the comparison area to center and allow relative positioning for children */}
          {'#comparisonContainer { min-height: 300px; position: relative; background-color: #eef2f6; border: 2px solid #cbd5e1; overflow: hidden; display: flex; align-items: center; justify-content: center; }'}

          {/* Ensure overlap by using absolute positioning and traditional centering methods */}
          {'.screen-box { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); border: 4px solid; transition: all 0.5s ease-in-out; box-shadow: 0 0 10px rgba(0, 0, 0, 0.2); opacity: 0.85; box-sizing: content-box; }'}
        </style>

        <div className="w-full max-w-5xl bg-white p-8 shadow-2xl rounded-xl border border-gray-100">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-2 text-center">Dynamic Screen
            Comparator (React/TypeScript/RHF)</h1>
          <p className="text-gray-600 mb-8 text-center">Add, remove, and adjust screens to compare
            physical size and aspect ratio.</p>

          {/* Dynamic Controls */}
          <div id="screenControls" className="flex justify-center gap-4 mb-4">
            <button
                id="addScreenButton"
                onClick={addScreen}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition duration-200 shadow-md flex items-center gap-2"
                type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20"
                   fill="currentColor">
                <path fillRule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clipRule="evenodd"/>
              </svg>
              Add Screen
            </button>
          </div>

          {/* Dynamic Input Fields Container (Form Body) */}
          <form>
            <div id="screenInputsContainer"
                 className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {fields.map((field, index) => (<ScreenInputCard
                  key={field.id}
                  field={field}
                  index={index}
                  control={control}
                  remove={remove}
                  screenCount={fields.length}
                  updateComparison={updateComparison}
                  watch={watch}
              />))}
            </div>

            {/* The main button now triggers validation/calculation via onClick */}
            <button
                type="button"
                onClick={updateComparison}
                className="w-full bg-indigo-600 text-white p-4 rounded-lg font-bold text-lg hover:bg-indigo-700 transition duration-200 shadow-xl shadow-indigo-300"
            >
              Calculate & Update Comparison
            </button>
          </form>

          {errorMsg && (<p className="text-red-600 text-sm mt-4 text-center">{errorMsg}</p>)}

          {/* Visual Comparison Area */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Visual Comparison (1 inch = 10
              pixels)</h2>
            <div id="comparisonContainer">
              {ScreenBox}
              {calculatedScreens.length === 0 && !errorMsg && (
                  <p className="text-gray-500">Enter screen dimensions above to see the visual
                    comparison.</p>)}
            </div>
          </div>

          {/* Results Display */}
          <div id="results" className="mt-8 pt-6 border-t border-gray-200">
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
                <tbody id="resultsTableBody" className="bg-white divide-y divide-gray-200">
                {calculatedScreens.map((screen, index) => (
                    <ResultRow key={screen.id} screen={screen} index={index}/>))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>);
}

export default App;