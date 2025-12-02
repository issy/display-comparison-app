import React, {useCallback, useEffect, useState} from 'react';
import {
  Controller,
  type FieldValues,
  type Path,
  useFieldArray,
  useForm,
  type UseFormReturn
} from 'react-hook-form';
import {PlusIcon, Trash2Icon} from "lucide-react";

// --- Type Definitions ---

// Defines the structure of a single screen's input data
interface ScreenData {
  diagonal: number;
  aspectX: number; // Aspect Ratio X component (e.g., 16)
  aspectY: number; // Aspect Ratio Y component (e.g., 9)
  colour: string; // Hex code
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
// This function still requires the aspect ratio as a single number (ratio = X / Y)
const calculateDimensions = (diagonal: number, aspectRatio: number): CalculatedDimensions => {
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

// Predefined colours using standard Tailwind 500-level hex codes
const colourPalette: string[] = [
  '#f59e0b', // Amber-500
  '#10b981', // Emerald-500
  '#ef4444', // Red-500
  '#3b82f6', // Blue-500
  '#8b5cf6', // Violet-500
  '#f97316', // Orange-500
  '#a855f7', // Purple-500
  '#6366f1'  // Indigo-500
];

const getNextColour = (currentLength: number): string => {
  return colourPalette[currentLength % colourPalette.length];
};

const defaultScreens: ScreenData[] = [
  {diagonal: 27, aspectX: 16, aspectY: 9, colour: "#3b82f6"}, // 16:9
  {diagonal: 32, aspectX: 21, aspectY: 9, colour: "#10b981"}  // 21:9
];

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
  const screenData = watch(`screens.${index}`);
  const screenColour = screenData ? screenData.colour : field.colour;

  // Custom validation rule for positive numbers
  const positiveNumber = {
    valueAsNumber: true,
    required: 'Value is required',
    min: {value: 0.1, message: 'Must be a positive number (> 0)'}
  };

  return (
      <div
          className="p-4 rounded-xl shadow-lg border"
          style={{borderColor: `${screenColour}40`, backgroundColor: `${screenColour}10`}}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-xl" style={{color: screenColour}}>Screen {index + 1}</h3>
          {screenCount > 1 && (
              <button
                  onClick={() => {
                    remove(index);
                    updateComparison();
                  }}
                  className="text-gray-500 hover:text-red-600 transition duration-150"
                  type="button"
              >
                <Trash2Icon/>
              </button>
          )}
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1"
                   htmlFor={`screens[${index}].diagonal`}>Diagonal (in)</label>
            <Controller
                name={`screens.${index}.diagonal` as Path<FormValues>}
                control={control}
                rules={positiveNumber}
                render={({field, fieldState: {error}}) => (
                    <>
                      <input
                          {...field}
                          onChange={(e) => {
                            e.preventDefault();
                            field.onChange(parseInt(e.currentTarget.value));
                          }}
                          type="number"
                          step="any"
                          className={`w-full p-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ${error ? 'border-red-500' : 'border-gray-300'}`}
                          onBlur={() => updateComparison()} // Trigger calculation on blur
                      />
                      {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
                    </>
                )}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Aspect Ratio
              (X:Y)</label>
            <div className="flex space-x-2">
              {/* Aspect X */}
              <Controller
                  name={`screens.${index}.aspectX` as Path<FormValues>}
                  control={control}
                  rules={positiveNumber}
                  render={({field, fieldState: {error}}) => (
                      <div className="flex-1">
                        <input
                            {...field}
                            type="number"
                            step="1"
                            placeholder="X (e.g., 16)"
                            className={`w-full p-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ${error ? 'border-red-500' : 'border-gray-300'}`}
                            onBlur={() => updateComparison()}
                        />
                        {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
                      </div>
                  )}
              />
              <span className="self-center text-lg text-gray-500">:</span>
              {/* Aspect Y */}
              <Controller
                  name={`screens.${index}.aspectY` as Path<FormValues>}
                  control={control}
                  rules={positiveNumber}
                  render={({field, fieldState: {error}}) => (
                      <div className="flex-1">
                        <input
                            {...field}
                            type="number"
                            step="1"
                            placeholder="Y (e.g., 9)"
                            className={`w-full p-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ${error ? 'border-red-500' : 'border-gray-300'}`}
                            onBlur={() => updateComparison()}
                        />
                        {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
                      </div>
                  )}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1"
                   htmlFor={`screens[${index}].colour`}>Outline Colour</label>
            <Controller
                name={`screens.${index}.colour` as Path<FormValues>}
                control={control}
                render={({field}) => (
                    <input
                        {...field}
                        type="color"
                        className="w-full h-10 p-1 border rounded-lg cursor-pointer"
                        onChange={(e) => {
                          field.onChange(e);
                          updateComparison();
                        }}
                    />
                )}
            />
          </div>
        </div>
      </div>
  );
};

interface ResultRowProps {
  screen: CalculatedScreen;
  index: number;
}

const ResultRow: React.FC<ResultRowProps> = ({screen, index}) => {
  return (
      <tr className="hover:bg-gray-50" style={{borderLeft: `4px solid ${screen.colour}`}}>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Screen {index + 1}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{screen.diagonal.toFixed(1)}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">{screen.width.toFixed(2)}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">{screen.height.toFixed(2)}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{`${screen.aspectX}:${screen.aspectY}`}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">{screen.area.toFixed(2)}</td>
      </tr>
  )
};

interface ScreenVisualizerProps {
  calculatedScreens: CalculatedScreen[];
}

// New reusable component for rendering the visual screen boxes
const ScreenVisualizer: React.FC<ScreenVisualizerProps> = ({calculatedScreens}) => {
  return (
      <div
          className="relative bg-gray-100 border-2 border-gray-300 overflow-hidden flex items-center justify-center min-h-[300px] rounded-xl shadow-inner">
        {calculatedScreens.map((screen, index) => (
            <div
                key={screen.id}
                // Tailwind classes for the overlap logic:
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                               border-[4px] transition-all duration-500 ease-in-out shadow-xl opacity-90 box-content rounded-lg"
                style={{
                  width: `${screen.width * SCALE_FACTOR}px`,
                  height: `${screen.height * SCALE_FACTOR}px`,
                  borderColor: screen.colour,
                  backgroundColor: `${screen.colour}20`,
                  borderStyle: 'solid',
                  zIndex: index + 1, // Stack order
                }}
            />
        ))}
        {calculatedScreens.length === 0 && (
            <p className="text-gray-500">Enter screen dimensions above to see the visual
              comparison.</p>
        )}
      </div>
  );
};

// --- Main Component ---
const App: React.FC = () => {
  // 1. Initialize useForm with FormValues type
  const {control, watch, getValues, formState: {errors}} = useForm<FormValues>({
    defaultValues: {screens: defaultScreens},
    mode: "onBlur"
  });

  // 2. Initialize useFieldArray for dynamic screen list
  const {fields, append, remove} = useFieldArray({
    control,
    name: "screens",
  });

  // State for calculated data
  const [calculatedScreens, setCalculatedScreens] = useState<CalculatedScreen[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');

  /**
   * Core logic to calculate dimensions and update the results state.
   */
  const updateComparison = useCallback(() => {
    const currentScreens = getValues('screens');
    const results: CalculatedScreen[] = [];
    let hasError = false;

    if (Object.keys(errors).length > 0) {
      setErrorMsg("Please correct the input errors (highlighted in red).");
      setCalculatedScreens([]);
      return;
    }

    currentScreens.forEach((screen, index) => {
      const {diagonal, aspectX, aspectY} = screen; // Read aspectX and aspectY

      // Validate all necessary inputs are positive numbers
      if (isNaN(diagonal) || diagonal <= 0 || isNaN(aspectX) || aspectX <= 0 || isNaN(aspectY) || aspectY <= 0) {
        hasError = true;
      }

      // Calculate the single ratio number (X/Y) for the geometry formula
      const ratio = aspectX / aspectY;

      const dims = calculateDimensions(diagonal, ratio);
      results.push({...screen, ...dims, id: fields[index].id});
    });

    if (hasError) {
      setErrorMsg("Please ensure all screens have valid, positive diagonal, X, and Y values.");
      setCalculatedScreens([]);
    } else {
      setErrorMsg('');
      setCalculatedScreens(results);
    }
  }, [getValues, errors, fields]);

  // Run calculation on initial load and when RHF fields change
  useEffect(() => {
    const subscription = watch(() => {
      // Delay running the comparison slightly to allow RHF validation to catch up
      setTimeout(() => updateComparison(), 50);
    });

    // Initial run
    updateComparison();

    return () => subscription.unsubscribe();
  }, [watch, updateComparison]);

  const addScreen = (): void => {
    if (fields.length >= 6) {
      setErrorMsg("Maximum of 6 screens allowed for comparison.");
      return;
    }
    setErrorMsg('');

    const newScreen: ScreenData = {
      diagonal: 24,
      aspectX: 16, // Default to 16:9
      aspectY: 9,
      colour: getNextColour(fields.length)
    };
    append(newScreen);
  };

  return (
      <div
          className="min-h-screen flex flex-col items-center justify-start py-8 px-4 bg-gray-50 font-sans"
      >
        <div className="w-full max-w-5xl bg-white p-8 shadow-2xl rounded-xl border border-gray-100">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-2 text-center">Display
            Comparison</h1>
          <p className="text-gray-600 mb-8 text-center">Add, remove, and adjust screens to compare
            physical size and aspect ratio</p>

          {/* Dynamic Controls */}
          <div className="flex justify-center gap-4 mb-4">
            <button
                onClick={addScreen}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition duration-200 shadow-md flex items-center gap-2"
                type="button"
            >
              <PlusIcon/>
              Add Screen
            </button>
          </div>

          {/* Dynamic Input Fields Container (Form Body) */}
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {fields.map((field, index) => (
                  <ScreenInputCard
                      key={field.id}
                      field={field}
                      index={index}
                      control={control}
                      remove={remove}
                      screenCount={fields.length}
                      updateComparison={updateComparison}
                      watch={watch}
                  />
              ))}
            </div>

            {/* The main button triggers validation/calculation */}
            <button
                type="button"
                onClick={updateComparison}
                className="w-full bg-indigo-600 text-white p-4 rounded-lg font-bold text-lg hover:bg-indigo-700 transition duration-200 shadow-xl shadow-indigo-300"
            >
              Calculate & Update Comparison
            </button>
          </form>

          {errorMsg && (
              <p className="text-red-600 text-sm mt-4 text-center">{errorMsg}</p>
          )}

          {/* Visual Comparison Area */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Visual Comparison (1 inch = 10
              pixels)</h2>
            {/* Use the new ScreenVisualizer component */}
            <ScreenVisualizer calculatedScreens={calculatedScreens}/>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aspect
                    Ratio (X:Y)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area
                    (sq in)
                  </th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {calculatedScreens.map((screen, index) => (
                    <ResultRow key={screen.id} screen={screen} index={index}/>
                ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
  );
}

export default App;
