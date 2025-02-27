import { useState, useEffect, useRef } from "react"

/**
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 */
export default function Tour_Calculator() {
  const [numDays, setNumDays] = useState(7)
  const [numPeople, setNumPeople] = useState(10)
  const [dayConfigs, setDayConfigs] = useState([])
  const [currency, setCurrency] = useState("JPY")
  const [showSettings, setShowSettings] = useState(false)
  const summaryRef = useRef(null)
  const [isSummaryVisible, setIsSummaryVisible] = useState(true)

  // Cost configurations with updated values and new bus category
  const [costs, setCosts] = useState({
    hotel: {
      standard: 20000,
      business: 40000,
      luxury: 80000,
    },
    tourismActivities: {
      "city-tour-full-small": 150000,
      "city-tour-half-small": 70000,
      "city-tour-full-large": 250000,
      "city-tour-half-large": 150000,
    },
    tourGuides: {
      "jr-tour-guide": 15000,
      "tour-guide": 30000,
      "sr-tour-guide": 50000,
    },
    businessActivities: {
      // For "conference-full", we now charge per person – see calculateDayTotal update.
      "conference-full": 15000,
      "business-meeting": 50000,
      "kaizen-half-day": 800000,
      "kaizen-full-day": 1600000,
      "ikigai-workshop-kamakura-full-day": 800000,
      "zen-and-tour-kamakura-full-day": 400000,
      "business-lectures-half-day": 300000,
    },
    bus: {
      "micro-mini-bus": 180000,
      "full-size-van": 70000,
      "medium-size-bus": 250000,
    },
    transport: {
      "airport-transfer": 40000,
      "city-transfer": 7000,
      "airport-transfer-small": 20000,
    },
    extras: {
      "translator-full": 50000,
      "translator-half": 30000,
      kimono: 5000,
      "sports-cars": 30000,
      "tea-ceremony": 3000,
      sumo: 5000,
      teamlabs: 5000,
      museum: 2000,
      onsen: 7000,
      "business-materials": 5000,
      "shinkansen-standard": 15000,
      "shinkansen-business": 30000,
      gift: 5000,
      expo: 8000,
      "special-side-event": 100000,
      "1h-public-speech": 50000,
      "snacks-and-drinks": 50000,
    },
    meals: {
      "lunch-standard": 10000,
      "lunch-business": 25000,
      "lunch-luxury": 50000,
      "dinner-standard": 10000,
      "dinner-business": 25000,
      "dinner-luxury": 50000,
    },
  })

  const [exchangeRates] = useState({
    USD: 0.0064,
    KZT: 3.336,
  })

  // Mapping for nicer labels for tourism activities and bus activities
  const tourismActivityLabels = {
    "city-tour-full-small": "City Tour Full (Small Group (Max 7))",
    "city-tour-half-small": "City Tour Half (Small Group (Max 7))",
    "city-tour-full-large": "City Tour Full (8-18)",
    "city-tour-half-large": "City Tour Half (8-18)",
  }

  const busLabels = {
    "micro-mini-bus": "Micro/Mini Bus (15-21 people)",
    "full-size-van": "Full Size Van (6-9 people)",
    "medium-size-bus": "Medium Size Bus (27-28 people)",
  }

  // Initialize day configurations – added bus field with default ""
  useEffect(() => {
    setDayConfigs(
      Array(numDays)
        .fill()
        .map((_, index) => {
          if (numDays === 7) {
            if (index === 0) {
              // Day 1: No tourism; only dinner.
              return {
                hotel: "standard",
                tourismActivity: "",
                tourGuide: "",
                bus: "",
                businessActivity: "",
                transport: ["airport-transfer"],
                extras: [],
                meals: ["dinner-standard"],
              }
            } else if (index === 1) {
              // Day 2: "City Tour Full" and add Tea Ceremony and Kimono.
              return {
                hotel: "standard",
                tourismActivity:
                  numPeople <= 7
                    ? "city-tour-full-small"
                    : "city-tour-full-large",
                tourGuide: "",
                bus: "",
                businessActivity: "",
                transport: ["city-transfer"],
                extras: ["tea-ceremony", "kimono"],
                meals: ["lunch-standard", "dinner-standard"],
              }
            } else if (index === 5) {
              // Day 6: "City Tour Half" and Business Meeting.
              return {
                hotel: "standard",
                tourismActivity:
                  numPeople <= 7
                    ? "city-tour-half-small"
                    : "city-tour-half-large",
                tourGuide: "",
                bus: "",
                businessActivity: "business-meeting",
                transport: ["city-transfer"],
                extras: [],
                meals: ["dinner-business"],
              }
            } else if (index === 6) {
              // Day 7: No hotel, no meals.
              return {
                hotel: "",
                tourismActivity: "",
                tourGuide: "",
                bus: "",
                businessActivity: "",
                transport: ["airport-transfer"],
                extras: [],
                meals: [],
              }
            } else {
              // Other days (Day 3, 4, 5)
              return {
                hotel: "standard",
                tourismActivity:
                  numPeople <= 7
                    ? "city-tour-half-small"
                    : "city-tour-half-large",
                tourGuide: "",
                bus: "",
                businessActivity: "business-meeting",
                transport: ["city-transfer"],
                extras: [],
                meals: ["lunch-standard", "dinner-standard"],
              }
            }
          } else {
            const isFirstDay = index === 0
            const isLastDay = index === numDays - 1
            if (isFirstDay) {
              return {
                hotel: "standard",
                tourismActivity: "",
                tourGuide: "",
                bus: "",
                businessActivity: "",
                transport: ["airport-transfer"],
                extras: [],
                meals: ["lunch-standard"],
              }
            }
            if (isLastDay) {
              return {
                hotel: "",
                tourismActivity: "",
                tourGuide: "",
                bus: "",
                businessActivity: "",
                transport: ["airport-transfer"],
                extras: [],
                meals: [],
              }
            }
            return {
              hotel: "standard",
              tourismActivity:
                numPeople <= 7
                  ? "city-tour-half-small"
                  : "city-tour-half-large",
              tourGuide: "",
              bus: "",
              businessActivity: "business-meeting",
              transport: ["city-transfer"],
              extras: [],
              meals: ["lunch-standard", "dinner-standard"],
            }
          }
        })
    )
  }, [numDays, numPeople])

  // Set up IntersectionObserver to track visibility of Tour Summary.
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSummaryVisible(entry.isIntersecting)
      },
      { root: null, threshold: 0.1 }
    )
    if (summaryRef.current) {
      observer.observe(summaryRef.current)
    }
    return () => {
      if (summaryRef.current) observer.unobserve(summaryRef.current)
    }
  }, [summaryRef])

  // Updated formatCurrency: round numbers, use comma separators, no decimals.
  const formatCurrency = (amount) => {
    if (!amount) return "¥0"
    switch (currency) {
      case "USD":
        return `$${Math.round(amount * exchangeRates.USD).toLocaleString()}`
      case "KZT":
        return `${Math.round(amount * exchangeRates.KZT).toLocaleString()} KZT`
      default:
        return `¥${Math.round(amount).toLocaleString()}`
    }
  }

  // Calculate day total – note the special treatment for "conference-full" (per person)
  const calculateDayTotal = (config) => {
    let total = 0
    // Hotel (per person)
    if (config.hotel && costs.hotel[config.hotel]) {
      total += costs.hotel[config.hotel] * numPeople
    }
    // Tourism Activity (group)
    if (
      config.tourismActivity &&
      costs.tourismActivities[config.tourismActivity] !== undefined
    ) {
      total += costs.tourismActivities[config.tourismActivity]
    }
    // Tour Guide (group)
    if (config.tourGuide && costs.tourGuides[config.tourGuide]) {
      total += costs.tourGuides[config.tourGuide]
    }
    // Bus (group)
    if (config.bus && costs.bus[config.bus] !== undefined) {
      total += costs.bus[config.bus]
    }
    // Business Activity – if it's "conference-full", charge per person.
    if (
      config.businessActivity &&
      costs.businessActivities[config.businessActivity]
    ) {
      if (config.businessActivity === "conference-full") {
        total +=
          costs.businessActivities[config.businessActivity] *
          numPeople
      } else {
        total += costs.businessActivities[config.businessActivity]
      }
    }
    // Transport (using smarter allocation)
    const selectedTransports = config.transport.filter(
      (t) => costs.transport[t] !== undefined
    )
    const transportCapacities = {
      "airport-transfer": 9,
      "airport-transfer-small": 4,
      "city-transfer": 4,
    }
    if (selectedTransports.length > 0) {
      if (selectedTransports.length === 1) {
        const t = selectedTransports[0]
        const cap = transportCapacities[t]
        total += Math.ceil(numPeople / cap) * costs.transport[t]
      } else {
        let combinedCapacity = 0
        let transportCost = 0
        selectedTransports.forEach((t) => {
          combinedCapacity += transportCapacities[t]
          transportCost += costs.transport[t]
        })
        let remaining = numPeople - combinedCapacity
        while (remaining > 0) {
          let bestOption = null
          for (let t of selectedTransports) {
            const ratio =
              costs.transport[t] / transportCapacities[t]
            if (bestOption === null || ratio < bestOption.ratio) {
              bestOption = { type: t, ratio }
            }
          }
          combinedCapacity += transportCapacities[bestOption.type]
          transportCost += costs.transport[bestOption.type]
          remaining = numPeople - combinedCapacity
        }
        total += transportCost
      }
    }
    // Extras – use group pricing for selected extras.
    const groupExtras = [
      "translator-full",
      "translator-half",
      "special-side-event",
      "1h-public-speech",
      "snacks-and-drinks",
    ]
    config.extras.forEach((e) => {
      const cost = costs.extras[e]
      if (groupExtras.includes(e)) {
        total += cost
      } else {
        total += cost * numPeople
      }
    })
    // Meals (per person)
    config.meals.forEach((m) => {
      if (costs.meals[m]) {
        total += costs.meals[m] * numPeople
      }
    })
    return total
  }

  const calculateTotal = () =>
    dayConfigs.reduce((sum, config) => sum + calculateDayTotal(config), 0)

  const updateDayConfig = (index, field, value) => {
    setDayConfigs((prev) => {
      const newConfigs = [...prev]
      newConfigs[index] = { ...newConfigs[index], [field]: value }
      return newConfigs
    })
  }

  const updateDayConfigArray = (index, field, item, add) => {
    setDayConfigs((prev) => {
      const newConfigs = [...prev]
      const currentItems = newConfigs[index][field] || []
      newConfigs[index] = {
        ...newConfigs[index],
        [field]: add
          ? [...currentItems, item]
          : currentItems.filter((i) => i !== item),
      }
      return newConfigs
    })
  }

  const updateCost = (category, item, value) => {
    setCosts((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [item]: parseInt(value) || 0,
      },
    }))
  }

  // Calculate client price per person (50% margin)
  const clientPricePerPerson = Math.round((calculateTotal() * 2) / numPeople)
  const clientPricePerPersonJPY = `¥${clientPricePerPerson.toLocaleString()}`
  const clientPricePerPersonUSD = `$${Math.round(clientPricePerPerson * exchangeRates.USD).toLocaleString()}`
  const clientPricePerPersonKZT = `${Math.round(clientPricePerPerson * exchangeRates.KZT).toLocaleString()} KZT`

  // Helper function to capitalize each word
  const capitalizeWords = (str) =>
    str
      .split(/[-\s]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <h2 style={headerStyle}>Business Mission In Japan</h2>
        <div style={controlsStyle}>
          <div style={inputGroupStyle}>
            <label>
              Number Of Days:
              <input
                type="number"
                min="1"
                max="14"
                value={numDays}
                onChange={(e) =>
                  setNumDays(parseInt(e.target.value))
                }
                style={inputStyle}
              />
            </label>
          </div>
          <div style={inputGroupStyle}>
            <label>
              Number Of People:
              <input
                type="number"
                min="1"
                value={numPeople}
                onChange={(e) =>
                  setNumPeople(parseInt(e.target.value))
                }
                style={inputStyle}
              />
            </label>
          </div>
          <div style={inputGroupStyle}>
            <label>
              Currency:
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                style={selectStyle}
              >
                <option value="JPY">JPY</option>
                <option value="USD">USD</option>
                <option value="KZT">KZT</option>
              </select>
            </label>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={buttonStyle}
          >
            {showSettings ? "Hide Settings" : "Show Settings"}
          </button>
        </div>

        {showSettings && (
          <div style={settingsCardStyle}>
            <h3 style={subHeaderStyle}>Cost Settings</h3>
            {Object.entries(costs).map(
              ([category, items], categoryIndex) => (
                <div
                  key={`category-${categoryIndex}`}
                  style={settingsSectionStyle}
                >
                  <h4 style={settingsHeaderStyle}>
                    {capitalizeWords(category)}
                  </h4>
                  {Object.entries(items).map(
                    ([key, value], itemIndex) => (
                      <div
                        key={`${category}-${itemIndex}`}
                        style={settingsItemStyle}
                      >
                        <label>
                          {capitalizeWords(key.replace(/-/g, " "))}:
                          <input
                            type="number"
                            value={value}
                            onChange={(e) =>
                              updateCost(
                                category,
                                key,
                                e.target.value
                              )
                            }
                            style={inputStyle}
                          />
                        </label>
                      </div>
                    )
                  )}
                </div>
              )
            )}
          </div>
        )}

        {dayConfigs.map((config, dayIndex) => (
          <div key={`day-${dayIndex}`} style={dayCardStyle}>
            <h3 style={subHeaderStyle}>Day {dayIndex + 1}</h3>

            <div style={sectionStyle}>
              <label>
                Hotel Type:
                <select
                  value={config.hotel}
                  onChange={(e) =>
                    updateDayConfig(
                      dayIndex,
                      "hotel",
                      e.target.value
                    )
                  }
                  style={selectStyle}
                >
                  <option value="">None</option>
                  {Object.entries(costs.hotel).map(
                    ([type, cost], index) => (
                      <option
                        key={`hotel-${index}`}
                        value={type}
                      >
                        {capitalizeWords(type)} (
                        {formatCurrency(cost)}/person)
                      </option>
                    )
                  )}
                </select>
              </label>
            </div>

            <div style={sectionStyle}>
              <label>
                Tourism Activity:
                <select
                  value={config.tourismActivity || ""}
                  onChange={(e) =>
                    updateDayConfig(
                      dayIndex,
                      "tourismActivity",
                      e.target.value
                    )
                  }
                  style={selectStyle}
                >
                  <option value="">None</option>
                  {Object.entries(
                    costs.tourismActivities
                  ).map(([type, cost], index) => (
                    <option
                      key={`tourism-${index}`}
                      value={type}
                    >
                      {tourismActivityLabels[type] || capitalizeWords(type)} (
                      {formatCurrency(cost)})
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div style={sectionStyle}>
              <label>
                Tour Guide:
                <select
                  value={config.tourGuide || ""}
                  onChange={(e) =>
                    updateDayConfig(
                      dayIndex,
                      "tourGuide",
                      e.target.value
                    )
                  }
                  style={selectStyle}
                >
                  <option value="">None</option>
                  {Object.entries(costs.tourGuides).map(
                    ([type, cost], index) => (
                      <option
                        key={`tourguide-${index}`}
                        value={type}
                      >
                        {capitalizeWords(type.replace(/-/g, " "))} (
                        {formatCurrency(cost)})
                      </option>
                    )
                  )}
                </select>
              </label>
            </div>

            {/* New Bus Dropdown */}
            <div style={sectionStyle}>
              <label>
                Bus:
                <select
                  value={config.bus || ""}
                  onChange={(e) =>
                    updateDayConfig(
                      dayIndex,
                      "bus",
                      e.target.value
                    )
                  }
                  style={selectStyle}
                >
                  <option value="">None</option>
                  {Object.entries(costs.bus).map(
                    ([type, cost], index) => (
                      <option key={`bus-${index}`} value={type}>
                        {busLabels[type] || capitalizeWords(type.replace(/-/g, " "))} (
                        {formatCurrency(cost)})
                      </option>
                    )
                  )}
                </select>
              </label>
            </div>

            <div style={sectionStyle}>
              <label>
                Business Activity:
                <select
                  value={config.businessActivity || ""}
                  onChange={(e) =>
                    updateDayConfig(
                      dayIndex,
                      "businessActivity",
                      e.target.value
                    )
                  }
                  style={selectStyle}
                >
                  <option value="">None</option>
                  {Object.entries(costs.businessActivities).map(
                    ([type, cost], index) => (
                      <option
                        key={`business-${index}`}
                        value={type}
                      >
                        {capitalizeWords(type.replace(/-/g, " "))} (
                        {formatCurrency(cost)})
                      </option>
                    )
                  )}
                </select>
              </label>
            </div>

            <div style={sectionStyle}>
              <p style={labelStyle}>Transport:</p>
              {Object.entries(costs.transport).map(
                ([type, cost], index) => {
                  if (
                    type === "city-transfer" &&
                    (dayIndex === 0 ||
                      dayIndex === dayConfigs.length - 1)
                  )
                    return null
                  return (
                    <label
                      key={`transport-${index}`}
                      style={checkboxLabelStyle}
                    >
                      <input
                        type="checkbox"
                        checked={config.transport.includes(
                          type
                        )}
                        onChange={(e) =>
                          updateDayConfigArray(
                            dayIndex,
                            "transport",
                            type,
                            e.target.checked
                          )
                        }
                        style={checkboxStyle}
                      />
                      {capitalizeWords(type.replace(/-/g, " "))} (
                      {formatCurrency(cost)}/
                      {type === "airport-transfer"
                        ? "car, max 9 people"
                        : "car, max 4 people"}
                      )
                    </label>
                  )
                }
              )}
            </div>

            <div style={sectionStyle}>
              <p style={labelStyle}>Meals:</p>
              <div style={mealsGridStyle}>
                <div>
                  <select
                    value={
                      config.meals.find((m) =>
                        m.startsWith("lunch-")
                      ) || ""
                    }
                    onChange={(e) => {
                      const newMeals =
                        config.meals.filter(
                          (m) =>
                            !m.startsWith("lunch-")
                        )
                      if (e.target.value)
                        newMeals.push(e.target.value)
                      updateDayConfig(
                        dayIndex,
                        "meals",
                        newMeals
                      )
                    }}
                    style={selectStyle}
                  >
                    <option value="">No Lunch</option>
                    {Object.entries(costs.meals)
                      .filter(([key]) =>
                        key.startsWith("lunch-")
                      )
                      .map(([type, cost], index) => (
                        <option
                          key={`lunch-${index}`}
                          value={type}
                        >
                          {capitalizeWords(type.replace(/-/g, " "))} (
                          {formatCurrency(cost)}
                          /person)
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <select
                    value={
                      config.meals.find((m) =>
                        m.startsWith("dinner-")
                      ) || ""
                    }
                    onChange={(e) => {
                      const newMeals =
                        config.meals.filter(
                          (m) =>
                            !m.startsWith("dinner-")
                        )
                      if (e.target.value)
                        newMeals.push(e.target.value)
                      updateDayConfig(
                        dayIndex,
                        "meals",
                        newMeals
                      )
                    }}
                    style={selectStyle}
                  >
                    <option value="">No Dinner</option>
                    {Object.entries(costs.meals)
                      .filter(([key]) =>
                        key.startsWith("dinner-")
                      )
                      .map(([type, cost], index) => (
                        <option
                          key={`dinner-${index}`}
                          value={type}
                        >
                          {capitalizeWords(type.replace(/-/g, " "))} (
                          {formatCurrency(cost)}
                          /person)
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>

            <div style={sectionStyle}>
              <p style={labelStyle}>Extras:</p>
              <div style={extrasGridStyle}>
                {Object.entries(costs.extras).map(
                  ([type, cost], index) => (
                    <label
                      key={`extra-${index}`}
                      style={checkboxLabelStyle}
                    >
                      <input
                        type="checkbox"
                        checked={config.extras.includes(
                          type
                        )}
                        onChange={(e) =>
                          updateDayConfigArray(
                            dayIndex,
                            "extras",
                            type,
                            e.target.checked
                          )
                        }
                        style={checkboxStyle}
                      />
                      {capitalizeWords(type.replace(/-/g, " "))} (
                      {formatCurrency(cost)}/
                      {[
                        "translator-full",
                        "translator-half",
                        "special-side-event",
                        "1h-public-speech",
                        "snacks-and-drinks",
                      ].includes(type)
                        ? "group"
                        : "person"}
                      )
                    </label>
                  )
                )}
              </div>
            </div>

            <div style={totalStyle}>
              <div>
                Day Total (Group):{" "}
                {formatCurrency(calculateDayTotal(config))}
              </div>
              <div>
                Day Total (Per Person):{" "}
                {formatCurrency(
                  Math.round(
                    calculateDayTotal(config) / numPeople
                  )
                )}
              </div>
            </div>
          </div>
        ))}

        <div ref={summaryRef} style={summaryCardStyle}>
          <h3 style={subHeaderStyle}>Tour Summary</h3>
          <div style={summaryGridStyle}>
            <div>
              <h4 style={summaryHeaderStyle}>Our Cost</h4>
              <div style={summarySectionStyle}>
                <p style={labelStyle}>JPY:</p>
                <p>
                  Total group cost: ¥
                  {calculateTotal().toLocaleString()}
                </p>
                <p>
                  Cost per person: ¥
                  {Math.round(
                    calculateTotal() / numPeople
                  ).toLocaleString()}
                </p>
              </div>
              <div style={summarySectionStyle}>
                <p style={labelStyle}>USD:</p>
                <p>
                  Total group cost: $
                  {Math.round(
                    calculateTotal() * exchangeRates.USD
                  ).toLocaleString()}
                </p>
                <p>
                  Cost per person: $
                  {Math.round(
                    (calculateTotal() / numPeople) *
                    exchangeRates.USD
                  ).toLocaleString()}
                </p>
              </div>
              <div style={summarySectionStyle}>
                <p style={labelStyle}>KZT:</p>
                <p>
                  Total group cost:{" "}
                  {Math.round(
                    calculateTotal() * exchangeRates.KZT
                  ).toLocaleString()}{" "}
                  KZT
                </p>
                <p>
                  Cost per person:{" "}
                  {Math.round(
                    (calculateTotal() / numPeople) *
                    exchangeRates.KZT
                  ).toLocaleString()}{" "}
                  KZT
                </p>
              </div>
            </div>

            <div>
              <h4 style={summaryHeaderStyle}>
                Client Price Per Person
              </h4>
              <div style={summarySectionStyle}>
                <p style={labelStyle}>JPY:</p>
                <p>{clientPricePerPersonJPY}</p>
              </div>
              <div style={summarySectionStyle}>
                <p style={labelStyle}>USD:</p>
                <p>{clientPricePerPersonUSD}</p>
              </div>
              <div style={summarySectionStyle}>
                <p style={labelStyle}>KZT:</p>
                <p>{clientPricePerPersonKZT}</p>
              </div>
            </div>
          </div>
          <div style={summaryFooterStyle}>
            <p>Number Of People: {numPeople}</p>
            <p>Number Of Days: {numDays}</p>
          </div>
        </div>
      </div>
      {/* Sticky summary bar when Tour Summary is out of view */}
      {!isSummaryVisible && (
        <div style={stickySummaryStyle}>
          <p>
            Client Price Per Person: {clientPricePerPersonKZT} /{" "}
            {clientPricePerPersonUSD} / {clientPricePerPersonJPY}
          </p>
          <p>
            Number Of People: {numPeople} | Number Of Days:{" "}
            {numDays}
          </p>
        </div>
      )}
    </div>
  )
}

const containerStyle = {
  width: "100%",
  minHeight: "100%",
  padding: "20px",
  boxSizing: "border-box",
  overflow: "auto",
}

const contentStyle = {
  maxWidth: "800px",
  margin: "0 auto",
  fontFamily: "system-ui, -apple-system, sans-serif",
}

const headerStyle = {
  fontSize: "24px",
  fontWeight: "bold",
  marginBottom: "20px",
}

const controlsStyle = {
  display: "flex",
  gap: "20px",
  marginBottom: "20px",
  flexWrap: "wrap",
}

const inputGroupStyle = {
  display: "flex",
  alignItems: "center",
}

const inputStyle = {
  marginLeft: "8px",
  padding: "4px 8px",
  width: "80px",
  border: "1px solid #ccc",
  borderRadius: "4px",
}

const selectStyle = {
  marginLeft: "8px",
  padding: "4px 8px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  minWidth: "120px",
}

const buttonStyle = {
  padding: "8px 16px",
  backgroundColor: "#0066ff",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
}

const settingsCardStyle = {
  marginBottom: "24px",
  padding: "16px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  backgroundColor: "#f5f5f5",
}

const settingsSectionStyle = {
  marginBottom: "20px",
}

const settingsHeaderStyle = {
  fontSize: "16px",
  fontWeight: "600",
  marginBottom: "12px",
}

const settingsItemStyle = {
  marginBottom: "8px",
}

const dayCardStyle = {
  marginBottom: "20px",
  padding: "16px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  backgroundColor: "white",
}

const sectionStyle = {
  marginBottom: "16px",
}

const subHeaderStyle = {
  fontSize: "18px",
  fontWeight: "600",
  marginBottom: "16px",
}

const labelStyle = {
  fontWeight: "500",
  marginBottom: "8px",
}

const checkboxLabelStyle = {
  display: "block",
  marginBottom: "8px",
}

const checkboxStyle = {
  marginRight: "8px",
}

const mealsGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "8px",
}

const extrasGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
  gap: "8px",
}

const totalStyle = {
  marginTop: "16px",
  fontSize: "14px",
  color: "#666",
}

const summaryCardStyle = {
  marginTop: "24px",
  padding: "20px",
  backgroundColor: "#f5f5f5",
  borderRadius: "4px",
}

const summaryGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "32px",
}

const summaryHeaderStyle = {
  fontSize: "16px",
  fontWeight: "600",
  marginBottom: "16px",
}

const summarySectionStyle = {
  marginBottom: "16px",
}

const summaryFooterStyle = {
  marginTop: "16px",
  paddingTop: "16px",
  borderTop: "1px solid #ccc",
}

const stickySummaryStyle = {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: "#f5f5f5",
  borderTop: "1px solid #ccc",
  padding: "10px 20px",
  fontFamily: "system-ui, -apple-system, sans-serif",
  zIndex: 1000,
}
