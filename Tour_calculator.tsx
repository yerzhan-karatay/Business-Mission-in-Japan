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

    // Cost configurations
    const [costs, setCosts] = useState({
        hotel: {
            standard: 15000,
            business: 30000, // updated from 25000
            luxury: 60000, // updated from 50000
        },
        tourismActivities: {
            "city-tour-full": 150000, // updated from 100000
            "city-tour-half": 70000, // updated from 50000 (per group)
            "free-day": 0,
        },
        businessActivities: {
            "conference-full": 100000, // updated from 150000
            "business-meeting": 50000,
            "kaizen-half-day": 800000, // added
            "kaizen-full-day": 1600000, // added
            "ikigai-workshop-kamakura-full-day": 800000, // added
            "zen-and-tour-kamakura-full-day": 400000, // added
            "business-lectures-half-day": 300000, // added
        },
        transport: {
            "airport-transfer": 40000,
            "city-transfer": 7000,
            "airport-transfer-small": 20000, // added (max 4 people)
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
            "business-materials": 5000, // added (per person)
            "shinkansen-standard": 15000, // added (per person)
            "shinkansen-business": 30000, // added (per person)
            gift: 5000, // added (per person)
            expo: 8000, // added (per person)
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

    // Initialize day configurations
    useEffect(() => {
        setDayConfigs(
            Array(numDays)
                .fill()
                .map((_, index) => {
                    // If 7-day itinerary, use our custom defaults.
                    if (numDays === 7) {
                        if (index === 0) {
                            // Day 1: Remove tourism activity and only dinner.
                            return {
                                hotel: "standard",
                                tourismActivity: "",
                                businessActivity: "",
                                transport: ["airport-transfer"],
                                extras: [],
                                meals: ["dinner-standard"],
                            }
                        } else if (index === 1) {
                            // Day 2: Use "City Tour Full" only (no business activity)
                            // and add tea ceremony and kimono extras.
                            return {
                                hotel: "standard",
                                tourismActivity: "city-tour-full",
                                businessActivity: "",
                                transport: ["city-transfer"],
                                extras: ["tea-ceremony", "kimono"],
                                meals: ["lunch-standard", "dinner-standard"],
                            }
                        } else if (index === 5) {
                            // Day 6: Override meals to only dinner business.
                            return {
                                hotel: "standard",
                                tourismActivity: "city-tour-half",
                                businessActivity: "business-meeting",
                                transport: ["city-transfer"],
                                extras: [],
                                meals: ["dinner-business"],
                            }
                        } else if (index === 6) {
                            // Day 7: Unselect hotel type and all meals.
                            return {
                                hotel: "",
                                tourismActivity: "",
                                businessActivity: "",
                                transport: ["airport-transfer"],
                                extras: [],
                                meals: [],
                            }
                        } else {
                            // Other days (Day 3, 4, 5)
                            return {
                                hotel: "standard",
                                tourismActivity: "city-tour-half",
                                businessActivity: "business-meeting",
                                transport: ["city-transfer"],
                                extras: [],
                                meals: ["lunch-standard", "dinner-standard"],
                            }
                        }
                    } else {
                        // For itineraries not equal to 7 days, use previous logic.
                        const isFirstDay = index === 0
                        const isLastDay = index === numDays - 1

                        if (isFirstDay) {
                            return {
                                hotel: "standard",
                                tourismActivity: "",
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
                                businessActivity: "",
                                transport: ["airport-transfer"],
                                extras: [],
                                meals: [],
                            }
                        }

                        return {
                            hotel: "standard",
                            tourismActivity: "city-tour-half",
                            businessActivity: "business-meeting",
                            transport: ["city-transfer"],
                            extras: [],
                            meals: ["lunch-standard", "dinner-standard"],
                        }
                    }
                })
        )
    }, [numDays])

    // Set up IntersectionObserver to check if the summary is in view.
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
            if (summaryRef.current) {
                observer.unobserve(summaryRef.current)
            }
        }
    }, [summaryRef])

    const formatCurrency = (amount) => {
        if (amount === 0 || !amount) return "¥0"
        switch (currency) {
            case "USD":
                return `$${(amount * exchangeRates.USD).toFixed(2)}`
            case "KZT":
                return `${(amount * exchangeRates.KZT).toFixed(0)} KZT`
            default:
                return `¥${amount.toLocaleString()}`
        }
    }

    const calculateDayTotal = (config) => {
        let total = 0

        // Hotel costs (per person)
        if (config.hotel && costs.hotel[config.hotel]) {
            total += costs.hotel[config.hotel] * numPeople
        }

        // Tourism Activity costs (per group)
        if (
            config.tourismActivity &&
            costs.tourismActivities[config.tourismActivity]
        ) {
            total += costs.tourismActivities[config.tourismActivity]
        }

        // Business Activity costs (per group)
        if (
            config.businessActivity &&
            costs.businessActivities[config.businessActivity]
        ) {
            total += costs.businessActivities[config.businessActivity]
        }

        // Transport costs – using smarter capacity allocation.
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
                // Allocate one vehicle per selected type first.
                let combinedCapacity = 0
                let transportCost = 0
                selectedTransports.forEach((t) => {
                    combinedCapacity += transportCapacities[t]
                    transportCost += costs.transport[t]
                })
                let remaining = numPeople - combinedCapacity
                // If additional capacity is needed, add vehicles using the best cost efficiency.
                while (remaining > 0) {
                    let bestOption = null
                    for (let t of selectedTransports) {
                        const ratio = costs.transport[t] / transportCapacities[t]
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

        // Extras costs
        config.extras.forEach((e) => {
            const cost = costs.extras[e]
            if (e.startsWith("translator")) {
                // Translator costs are per group
                total += cost
            } else {
                // Other extras are per person
                total += cost * numPeople
            }
        })

        // Meals costs (per person)
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

    // Calculate client price (50% margin) for sticky summary
    const clientPrice = calculateTotal() * 2
    const clientPriceJPY = `¥${clientPrice.toLocaleString()}`
    const clientPriceUSD = `$${(clientPrice * exchangeRates.USD).toFixed(2)}`
    const clientPriceKZT = `${Math.round(clientPrice * exchangeRates.KZT).toLocaleString()} KZT`

    return (
        <div style={containerStyle}>
            <div style={contentStyle}>
                <h2 style={headerStyle}>Business Mission in Japan</h2>

                <div style={controlsStyle}>
                    <div style={inputGroupStyle}>
                        <label>
                            Number of Days:
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
                            Number of People:
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
                                        {category.charAt(0).toUpperCase() +
                                            category.slice(1)}
                                    </h4>
                                    {Object.entries(items).map(
                                        ([key, value], itemIndex) => (
                                            <div
                                                key={`${category}-${itemIndex}`}
                                                style={settingsItemStyle}
                                            >
                                                <label>
                                                    {key
                                                        .split("-")
                                                        .map(
                                                            (word) =>
                                                                word.charAt(0) +
                                                                word.slice(1)
                                                        )
                                                        .join(" ")}
                                                    :
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
                                                {type.charAt(0).toUpperCase() +
                                                    type.slice(1)}{" "}
                                                ({formatCurrency(cost)}/person)
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
                                    onChange={(e) => {
                                        updateDayConfig(
                                            dayIndex,
                                            "tourismActivity",
                                            e.target.value
                                        )
                                    }}
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
                                            {type
                                                .split("-")
                                                .map(
                                                    (word) =>
                                                        word.charAt(0) +
                                                        word.slice(1)
                                                )
                                                .join(" ")}{" "}
                                            ({formatCurrency(cost)})
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <div style={sectionStyle}>
                            <label>
                                Business Activity:
                                <select
                                    value={config.businessActivity || ""}
                                    onChange={(e) => {
                                        const newValue = e.target.value
                                        updateDayConfig(
                                            dayIndex,
                                            "businessActivity",
                                            newValue
                                        )
                                    }}
                                    style={selectStyle}
                                >
                                    <option value="">None</option>
                                    {Object.entries(
                                        costs.businessActivities
                                    ).map(([type, cost], index) => (
                                        <option
                                            key={`business-${index}`}
                                            value={type}
                                        >
                                            {type
                                                .split("-")
                                                .map(
                                                    (word) =>
                                                        word.charAt(0) +
                                                        word.slice(1)
                                                )
                                                .join(" ")}{" "}
                                            ({formatCurrency(cost)})
                                        </option>
                                    ))}
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
                                    ) {
                                        return null
                                    }
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
                                            {type
                                                .split("-")
                                                .map(
                                                    (word) =>
                                                        word.charAt(0) +
                                                        word.slice(1)
                                                )
                                                .join(" ")}
                                            ({formatCurrency(cost)}/
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
                                                    {type
                                                        .split("-")
                                                        .map(
                                                            (word) =>
                                                                word.charAt(0) +
                                                                word.slice(1)
                                                        )
                                                        .join(" ")}{" "}
                                                    ({formatCurrency(cost)}
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
                                                    {type
                                                        .split("-")
                                                        .map(
                                                            (word) =>
                                                                word.charAt(0) +
                                                                word.slice(1)
                                                        )
                                                        .join(" ")}{" "}
                                                    ({formatCurrency(cost)}
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
                                            {type
                                                .split("-")
                                                .map(
                                                    (word) =>
                                                        word.charAt(0) +
                                                        word.slice(1)
                                                )
                                                .join(" ")}
                                            ({formatCurrency(cost)}/
                                            {type.startsWith("translator")
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
                                    calculateDayTotal(config) / numPeople
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
                                    {(
                                        calculateTotal() * exchangeRates.USD
                                    ).toFixed(2)}
                                </p>
                                <p>
                                    Cost per person: $
                                    {(
                                        (calculateTotal() / numPeople) *
                                        exchangeRates.USD
                                    ).toFixed(2)}
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
                                Client Price (50% Margin)
                            </h4>
                            <div style={summarySectionStyle}>
                                <p style={labelStyle}>JPY:</p>
                                <p>
                                    Total group cost: ¥
                                    {(calculateTotal() * 2).toLocaleString()}
                                </p>
                                <p>
                                    Cost per person: ¥
                                    {Math.round(
                                        (calculateTotal() * 2) / numPeople
                                    ).toLocaleString()}
                                </p>
                            </div>
                            <div style={summarySectionStyle}>
                                <p style={labelStyle}>USD:</p>
                                <p>
                                    Total group cost: $
                                    {(
                                        calculateTotal() *
                                        2 *
                                        exchangeRates.USD
                                    ).toFixed(2)}
                                </p>
                                <p>
                                    Cost per person: $
                                    {(
                                        ((calculateTotal() * 2) / numPeople) *
                                        exchangeRates.USD
                                    ).toFixed(2)}
                                </p>
                            </div>
                            <div style={summarySectionStyle}>
                                <p style={labelStyle}>KZT:</p>
                                <p>
                                    Total group cost:{" "}
                                    {Math.round(
                                        calculateTotal() * 2 * exchangeRates.KZT
                                    ).toLocaleString()}{" "}
                                    KZT
                                </p>
                                <p>
                                    Cost per person:{" "}
                                    {Math.round(
                                        ((calculateTotal() * 2) / numPeople) *
                                            exchangeRates.KZT
                                    ).toLocaleString()}{" "}
                                    KZT
                                </p>
                            </div>
                        </div>
                    </div>

                    <div style={summaryFooterStyle}>
                        <p>Number of people: {numPeople}</p>
                        <p>Number of days: {numDays}</p>
                    </div>
                </div>
            </div>
            {/* Sticky summary bar shown when the Tour Summary section is out of view */}
            {!isSummaryVisible && (
                <div style={stickySummaryStyle}>
                    <p>
                        Client Price: {clientPriceKZT} / {clientPriceUSD} / {clientPriceJPY}
                    </p>
                    <p>
                        Number of people: {numPeople} | Number of days: {numDays}
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
