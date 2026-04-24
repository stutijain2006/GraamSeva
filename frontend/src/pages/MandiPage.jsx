import { useState, useEffect } from "react"
import mandiService from "../services/mandiService"
import { t } from "../lib/i18n"

export default function MandiPage({ tr, uiLanguage }) {
  const [mandiPrices, setMandiPrices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMandiPrices()
  }, [uiLanguage])

  const loadMandiPrices = async () => {
    try {
      setLoading(true)
      const result = await mandiService.getMandiPrices(uiLanguage)
      setMandiPrices(result.data)
      console.log(`Mandi prices loaded from ${result.source}:`, result.data)
    } catch (err) {
      console.error("Failed to load mandi prices:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ul className="collection rounded-lg shadow-md p-4 bg-white">
      <li className="collection-header">
        <h5 className="font-semibold ml-3 font-large">{t(uiLanguage, 'mandiTitle')}</h5>
      </li>
      {mandiPrices.map((mandi) => (
        <li key={mandi.id} className="collection-item">
          <div className="mb-2">
            <strong className="text-lg">{mandi.mandi}</strong>
            <p className="text-sm text-gray-500">{mandi.state}</p>
          </div>

          {mandi.crops.map((crop, index) => (
            <div
              key={index}
              className="flex justify-between items-center border-t pt-2 mt-2"
            >
              <div>
                <p className="font-medium">{crop.crop}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-700">{crop.price}</p>
                <p
                  className={`text-xs ${
                    crop.trend === "up"
                      ? "text-green-600"
                      : crop.trend === "down"
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  {crop.trend === "up" ? "↑" : crop.trend === "down" ? "↓" : "→"}{" "}
                  {crop.change}
                </p>
              </div>
            </div>
          ))}
        </li>
      ))}
    </ul>
  )
}