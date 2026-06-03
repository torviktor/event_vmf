import { MapContainer, TileLayer, CircleMarker, Popup, AttributionControl } from 'react-leaflet'

const ALEX_HOUSE = {
  id: 'alex-house',
  name: 'Алекс Хаус',
  address: 'г. Петергоф, Санкт-Петербургский пр., 44',
  coords: [59.879601, 29.908199],
  phone: '+7 (812) 420-57-41',
  yandex: 'https://yandex.ru/maps/?text=Алекс+Хаус+Санкт-Петербургский+44+Петергоф',
  comment: 'Место проведения банкета. Большой зал, банкет с 14:00.',
}

const CONFIRMED_COLOR = '#2d8659'

export default function Restaurants() {
  const r = ALEX_HOUSE

  return (
    <div className="section">
      <h2 className="section-title">Место проведения</h2>
      <p className="section-sub">Банкет встречи выпускников ВМИРЭ 2011 — ресторан «Алекс Хаус», Петергоф</p>

      <div className="rest-map-wrap">
        <MapContainer
          center={r.coords}
          zoom={15}
          scrollWheelZoom={true}
          attributionControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <AttributionControl prefix={false} position="bottomright" />
          <CircleMarker
            center={r.coords}
            radius={10}
            pathOptions={{
              color: '#ffffff',
              weight: 2,
              fillColor: CONFIRMED_COLOR,
              fillOpacity: 1,
            }}
          >
            <Popup>
              <div className="rest-popup">
                <b>{r.name}</b>
                <br />
                <span style={{fontSize:'0.85rem', color:'#666'}}>{r.address}</span>
              </div>
            </Popup>
          </CircleMarker>
        </MapContainer>
      </div>

      <div className="rest-grid">
        <div className="rest-card" style={{'--status': CONFIRMED_COLOR}}>
          <div className="rest-card-head">
            <h3>{r.name}</h3>
            <span className="rest-badge" style={{'--status': CONFIRMED_COLOR}}>Место проведения</span>
          </div>
          <div className="rest-meta">{r.address}</div>
          <div className="rest-desc">{r.comment}</div>
          <div className="rest-links">
            <a href={`tel:${r.phone.replace(/[^+\d]/g, '')}`}>📞 {r.phone}</a>
            <a href={r.yandex} target="_blank" rel="noopener noreferrer">Открыть на Яндекс.Картах</a>
          </div>
        </div>
      </div>
    </div>
  )
}
