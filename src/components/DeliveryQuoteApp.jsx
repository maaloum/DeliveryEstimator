import { useState } from 'react';

const products = {
  Sectional: 150,
  Sofa: 75,
  Loveseat: 75,
  chair: 50,
  'Coffee Table': 50,
  'Side Table': 25,
  'Dining Table': 100,
  'Dining Chair': 10,
  Buffet: 225,
  'China Cabinet': 225,
  Bed: 125,
  'Night Stand': 40,
  Dresser: 125,
  Mattress: 125,
  Wardrobe: 300,
  Vase: 20,
  Rug: 20,
  'Floor Lamp': 50,
  Frame: 20,
};

const deliveryFees = {
  '0-5': 25,
  '6-10': 50,
  '11-15': 75,
  '16-20': 100,
  '21-25': 125,
  '26-30': 150,
  '31-35': 175,
  '36-40': 200,
  '41-45': 250,
  '46+': 'Call for quote',
};

export default function DeliveryQuoteApp() {
  const [step, setStep] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState({});
  const [distanceRange, setDistanceRange] = useState('');

  const addProduct = (product) => {
    setSelectedProducts((prev) => ({
      ...prev,
      [product]: (prev[product] || 0) + 1,
    }));
  };

  const removeProduct = (product) => {
    setSelectedProducts((prev) => {
      const newState = { ...prev };
      if (newState[product] > 1) {
        newState[product] -= 1;
      } else {
        delete newState[product];
      }
      return newState;
    });
  };

  const getProductQuantity = (product) => selectedProducts[product] || 0;

  const getTotalItems = () => {
    return Object.values(selectedProducts).reduce(
      (sum, quantity) => sum + quantity,
      0
    );
  };

  const getDiscountedTotal = () => {
    const total = Object.entries(selectedProducts).reduce(
      (sum, [product, quantity]) => sum + products[product] * quantity,
      0
    );
    const totalItems = getTotalItems();
    if (totalItems >= 6) return total * 0.9;
    if (totalItems >= 5) return total * 0.95;
    return total;
  };

  const getDeliveryFee = () => deliveryFees[distanceRange];

  const quote =
    typeof getDeliveryFee() === 'number'
      ? getDiscountedTotal() + getDeliveryFee()
      : getDeliveryFee();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl bg-white/80 shadow-2xl backdrop-blur-sm">
          <div className="rounded-t-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <h2 className="text-center text-3xl font-bold">
              🚚 Delivery Quote Calculator
            </h2>
            <p className="mt-2 text-center text-blue-100">
              Get instant delivery quotes for your furniture
            </p>
          </div>

          <div className="p-6">
            {/* Progress Indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-center space-x-2">
                {[1, 2, 3].map((stepNumber) => (
                  <div key={stepNumber} className="flex items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-all duration-300 ${
                        step >= stepNumber
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-gray-300 bg-gray-100 text-gray-400'
                      }`}
                    >
                      {stepNumber}
                    </div>
                    {stepNumber < 3 && (
                      <div
                        className={`mx-2 h-1 w-8 rounded-full transition-all duration-300 ${
                          step > stepNumber ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-800">
                    Select Your Products
                  </h3>
                  <p className="mt-2 text-gray-600">
                    Choose the furniture items you need delivered
                  </p>
                </div>

                <div className="max-h-96 space-y-3 overflow-y-auto rounded-lg border border-gray-200 p-4">
                  {Object.keys(products).map((product) => (
                    <div
                      key={product}
                      className={`group flex items-center justify-between rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md ${
                        getProductQuantity(product) > 0
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className="h-5 w-5 accent-blue-600 transition-all duration-200"
                          checked={getProductQuantity(product) > 0}
                          onChange={() =>
                            getProductQuantity(product) > 0
                              ? removeProduct(product)
                              : addProduct(product)
                          }
                        />
                        <div>
                          <span className="font-semibold text-gray-800">
                            {product}
                          </span>
                          <div className="text-sm text-gray-500">
                            ${products[product]}
                          </div>
                        </div>
                      </div>

                      {getProductQuantity(product) > 0 && (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => removeProduct(product)}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition-all duration-200 hover:scale-110 hover:bg-red-600"
                          >
                            <span className="text-lg font-bold">−</span>
                          </button>
                          <span className="min-w-[3rem] text-center text-lg font-bold text-blue-600">
                            {getProductQuantity(product)}
                          </span>
                          <button
                            onClick={() => addProduct(product)}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white shadow-md transition-all duration-200 hover:scale-110 hover:bg-green-600"
                          >
                            <span className="text-lg font-bold">+</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">{getTotalItems()}</span>{' '}
                    items selected
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    disabled={getTotalItems() === 0}
                    className={`rounded-lg px-6 py-3 font-semibold text-white transition-all duration-200 ${
                      getTotalItems() > 0
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg'
                        : 'cursor-not-allowed bg-gray-400'
                    }`}
                  >
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-800">
                    Delivery Distance
                  </h3>
                  <p className="mt-2 text-gray-600">
                    Select your delivery location range
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Distance Range
                  </label>
                  <select
                    value={distanceRange}
                    onChange={(e) => setDistanceRange(e.target.value)}
                    className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-lg transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">Select your distance range</option>
                    {Object.keys(deliveryFees).map((range) => (
                      <option key={range} value={range}>
                        {range} miles - ${deliveryFees[range]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="rounded-lg border-2 border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-all duration-200 hover:border-gray-400 hover:bg-gray-50"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!distanceRange}
                    className={`rounded-lg px-6 py-3 font-semibold text-white transition-all duration-200 ${
                      distanceRange
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg'
                        : 'cursor-not-allowed bg-gray-400'
                    }`}
                  >
                    Get Quote →
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-800">
                    Your Quote Summary
                  </h3>
                  <p className="mt-2 text-gray-600">
                    Review your delivery quote details
                  </p>
                </div>

                <div className="rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="mb-3 font-semibold text-gray-800">
                        Selected Products
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(selectedProducts).map(
                          ([product, quantity]) => (
                            <div
                              key={product}
                              className="flex justify-between rounded-lg bg-white p-3 shadow-sm"
                            >
                              <span className="font-medium text-gray-700">
                                {quantity}x {product}
                              </span>
                              <span className="font-semibold text-gray-800">
                                ${(products[product] * quantity).toFixed(2)}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total Items:</span>
                          <span className="font-semibold">
                            {getTotalItems()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Product Total:</span>
                          <span className="font-semibold">
                            ${getDiscountedTotal().toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Distance:</span>
                          <span className="font-semibold">
                            {distanceRange} miles
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Distance Fee:</span>
                          <span className="font-semibold">
                            {typeof getDeliveryFee() === 'number'
                              ? `$${getDeliveryFee()}`
                              : getDeliveryFee()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between text-xl font-bold text-blue-700">
                        <span>Total:</span>
                        <span>
                          {typeof quote === 'number'
                            ? `$${quote.toFixed(2)}`
                            : quote}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="rounded-lg border-2 border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-all duration-200 hover:border-gray-400 hover:bg-gray-50"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => {
                      setStep(1);
                      setSelectedProducts({});
                      setDistanceRange('');
                    }}
                    className="rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 font-semibold text-white transition-all duration-200 hover:from-green-700 hover:to-emerald-700 hover:shadow-lg"
                  >
                    Start New Quote
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
