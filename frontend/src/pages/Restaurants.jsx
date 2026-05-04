import { useRef, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, AttributionControl } from 'react-leaflet'

const RESTAURANTS = [
  {
    id: 'teplo',
    name: 'Teplo',
    status: 'no',
    address: 'ул. Большая Морская, 45',
    metro: 'Адмиралтейская',
    coords: [59.9322, 30.3050],
    capacity: 'Приватная зона до 20 чел.',
    kids: '',
    check: 'Чек 1100–2500 ₽. Депозит ~2-3 тыс/чел.',
    phone: '+7 (812) 900-94-34',
    site: 'https://teplo.family/',
    yandex: 'https://yandex.ru/maps/?text=Teplo+Большая+Морская+45+Санкт-Петербург',
    comment: 'Слишком маленький приватный зал — для нашего числа гостей не подходит.',
  },
  {
    id: 'banshiki',
    name: '«Банщики»',
    status: 'go',
    address: 'Дегтярная ул., 1А',
    metro: 'Площадь Восстания',
    coords: [59.9311, 30.3625],
    capacity: 'Зал 2-го этажа до 60 чел., «Кабинет» до 36 чел.',
    kids: 'Детская комната на 1 этаже, домашнее детское меню.',
    check: 'Чек 2500–3500 ₽. Депозит от 200 тыс. ₽ + 10% сервис.',
    phone: '+7 (812) 941-17-44',
    site: 'https://banshiki.spb.ru/',
    yandex: 'https://yandex.ru/maps/?text=Банщики+Дегтярная+1А+Санкт-Петербург',
    comment: 'Звонил, информация сверена, можно бронировать.',
  },
  {
    id: 'r14',
    name: 'R14',
    status: 'go',
    address: 'Конюшенная пл., 2',
    metro: 'Невский проспект',
    coords: [59.9395, 30.3261],
    capacity: 'Панорамный зал на 35+ чел.',
    kids: 'Няня по выходным.',
    check: 'Средний чек ~3400 ₽. Депозита нет.',
    phone: '+7 (812) 918-69-69',
    site: 'https://probka.org/',
    yandex: 'https://yandex.ru/maps/?text=R14+Конюшенная+площадь+2+Санкт-Петербург',
    comment: 'Подтверждено, гибкие условия по депозиту.',
  },
  {
    id: 'parusa',
    name: '«Паруса на крыше»',
    status: 'no',
    address: 'ул. Льва Толстого, 9',
    metro: 'Петроградская',
    coords: [59.9670, 30.3119],
    capacity: 'Панорамный ресторан на крыше.',
    kids: '',
    check: 'Чек 2500–3500 ₽.',
    phone: '+7 (812) 991-10-90',
    site: 'https://nakryshe.parusa-spb.ru/',
    yandex: 'https://yandex.ru/maps/?text=Паруса+на+крыше+Льва+Толстого+9+Санкт-Петербург',
    comment: 'Площадка на ремонте, к дате встречи может быть закрыта.',
  },
  {
    id: 'polovtsov',
    name: 'Особняк Половцова',
    status: 'maybe',
    address: 'Большая Морская, 52',
    metro: 'Адмиралтейская',
    coords: [59.9319, 30.3030],
    capacity: 'Белый зал до 70 чел.',
    kids: '',
    check: 'От 2500 ₽ + аренда зала.',
    phone: '+7 (812) 571-27-29',
    site: '',
    yandex: 'https://yandex.ru/maps/?text=Особняк+Половцова+Санкт-Петербург',
    comment: 'Не удалось дозвониться, перезвонить через 2-3 дня.',
  },
  {
    id: 'capuletti',
    name: 'Capuletti',
    status: 'go',
    address: 'Конногвардейский б-р, 4',
    metro: 'Адмиралтейская',
    coords: [59.9341, 30.3010],
    capacity: 'Двухуровневый зал ~30-40 чел.',
    kids: 'Караоке, няни.',
    check: 'Средний чек ~3500 ₽. Свой алкоголь нельзя.',
    phone: '+7 (812) 232-22-82',
    site: 'https://ginza.ru/spb/restaurant/capuletti',
    yandex: 'https://yandex.ru/maps/?text=Capuletti+Конногвардейский+4+Санкт-Петербург',
    comment: 'Менеджер оперативно перезвонил, готовы держать дату.',
  },
  {
    id: 'mansarda',
    name: '«Мансарда»',
    status: 'maybe',
    address: 'Почтамтская, 3-5',
    metro: 'Адмиралтейская',
    coords: [59.9337, 30.3033],
    capacity: '2 зала по 30-40 чел., терраса до 80.',
    kids: '',
    check: 'Чек 3300–3800 ₽.',
    phone: '+7 (812) 640-16-16',
    site: 'https://ginza.ru/spb/restaurant/mansarda',
    yandex: 'https://yandex.ru/maps/?text=Мансарда+Почтамтская+3+Санкт-Петербург',
    comment: 'Менеджер не отвечает, нужна повторная попытка по будням.',
  },
  {
    id: 'ptichiy-dvor',
    name: 'Птичий двор',
    status: 'maybe',
    address: 'ул. Савушкина, 126',
    metro: 'Беговая',
    coords: [59.9925, 30.2257],
    capacity: 'Зал до 178 мест.',
    kids: 'Няня.',
    check: 'Чек 1500–2000 ₽. Банкет от 3000 ₽/чел.',
    phone: '+7 (812) 934-20-20',
    site: 'https://ptichiydvorspb.ru/',
    yandex: 'https://yandex.ru/maps/?text=Птичий+двор+Савушкина+126+Санкт-Петербург',
    comment: 'Далеко от ВМИРЭ, под вопросом из-за логистики.',
  },
  {
    id: 'moskva',
    name: 'Москва (Ginza)',
    status: 'maybe',
    address: 'Невский пр., 114',
    metro: 'Площадь Восстания',
    coords: [59.9333, 30.3593],
    capacity: 'Несколько зон.',
    kids: 'Детская «вокзал в миниатюре».',
    check: 'Банкет от 3500–4500 ₽.',
    phone: '+7 (812) 983-21-21',
    site: 'https://ginza.ru/spb/restaurant/moskva',
    yandex: 'https://yandex.ru/maps/?text=Ресторан+Москва+Невский+114+Санкт-Петербург',
    comment: 'Условия ждём в письме, дату держат предварительно.',
  },
  {
    id: 'stroganoff',
    name: 'Stroganoff Steak House',
    status: 'go',
    address: 'Конногвардейский б-р, 4',
    metro: 'Адмиралтейская',
    coords: [59.9343, 30.3015],
    capacity: 'Залы 14 / 40 / 100 чел.',
    kids: 'Игровая комната с няней.',
    check: 'Банкет от 3500 ₽. Депозит 100 тыс ₽.',
    phone: '+7 (812) 314-55-14',
    site: 'https://stroganoffgroup.ru/restaurants/stroganoff-steak-house/',
    yandex: 'https://yandex.ru/maps/?text=Stroganoff+Steak+House+Конногвардейский+4+Санкт-Петербург',
    comment: 'Близко к ВМИРЭ, держат дату, прислали бриф.',
  },
  {
    id: 'baklazhan',
    name: 'Баклажан (Великан-парк)',
    status: 'go',
    address: 'Александровский парк, 4/3',
    metro: 'Горьковская',
    coords: [59.9555, 30.3109],
    capacity: 'Зал до 250 чел., террасы 30/50.',
    kids: 'Огромная детская зона.',
    check: 'Банкет 3000–4000 ₽. Депозит 100-200 тыс ₽.',
    phone: '+7 (812) 640-16-16',
    site: 'https://ginza.ru/spb/restaurant/baklajan_velikanpark',
    yandex: 'https://yandex.ru/maps/?text=Баклажан+Великан-парк+Александровский+парк+Санкт-Петербург',
    comment: 'Очень близко к ВМИРЭ — основной кандидат.',
  },
  {
    id: 'aleksandr-park',
    name: 'Александровский парк',
    status: 'maybe',
    address: 'Александровский парк',
    metro: 'Горьковская',
    coords: [59.9559, 30.3122],
    capacity: 'Event-площадка под ключ.',
    kids: '',
    check: 'Цены под запрос.',
    phone: 'через сайт',
    site: 'https://aleksandrpark.ru/',
    yandex: 'https://yandex.ru/maps/?text=Александровский+парк+event+Санкт-Петербург',
    comment: 'Заявка отправлена через сайт, ждём ответ менеджера.',
  },
  {
    id: 'parkking',
    name: 'ParkKing',
    status: 'maybe',
    address: 'Александровский парк, 4',
    metro: 'Горьковская',
    coords: [59.9558, 30.3115],
    capacity: 'Двухуровневый, VIP-зал, терраса до 200 (летом).',
    kids: '',
    check: 'Цены под запрос. Свой алкоголь можно.',
    phone: '+7 (812) 498-06-00',
    site: '',
    yandex: 'https://yandex.ru/maps/?text=ParkKing+Александровский+парк+Санкт-Петербург',
    comment: 'Телефон не полный, нужно уточнить и перезвонить.',
  },
  {
    id: 'bayazet',
    name: '«Баязет»',
    status: 'go',
    address: 'наб. Фонтанки, 112',
    metro: 'Технологический институт',
    coords: [59.9217, 30.3210],
    capacity: '3 этажа, банкет 30–120 чел.',
    kids: '',
    check: 'От 2500–3500 ₽. Закрытие зала 100 тыс ₽.',
    phone: '+7 (812) 317-00-00',
    site: 'https://bayazet.spb.ru/',
    yandex: 'https://yandex.ru/maps/?text=Баязет+Фонтанка+112+Санкт-Петербург',
    comment: 'Свой алкоголь без сбора — большой плюс.',
  },
  {
    id: 'koryushka',
    name: 'Корюшка (Ginza)',
    status: 'go',
    address: 'Петропавловская крепость, 3',
    metro: 'Горьковская',
    coords: [59.9505, 30.3171],
    capacity: '340 мест, виды на Неву.',
    kids: 'Няня каждый день.',
    check: 'Банкет от 3000 ₽.',
    phone: '+7 (812) 640-16-16',
    site: 'https://ginza.ru/spb/restaurant/koryushka',
    yandex: 'https://yandex.ru/maps/?text=Корюшка+Петропавловская+крепость+Санкт-Петербург',
    comment: 'Рядом с ВМИРЭ, виды и формат подходят — твёрдый кандидат.',
  },
  {
    id: 'severyanin',
    name: '«Северянин»',
    status: 'no',
    address: 'Столярный пер., 18',
    metro: 'Садовая',
    coords: [59.9272, 30.3083],
    capacity: 'Камерный зал до 45 чел.',
    kids: 'Отдельной детской комнаты нет.',
    check: 'Банкет от 3000 ₽. Депозит 150 тыс ₽.',
    phone: '+7 (812) 200-71-00',
    site: 'https://www.severyanin.me/',
    yandex: 'https://yandex.ru/maps/?text=Северянин+Столярный+18+Санкт-Петербург',
    comment: 'Без детской зоны не подходит для семейного формата.',
  },
  {
    id: 'schwabski',
    name: '«Швабский домик»',
    status: 'maybe',
    address: 'Новочеркасский пр., 28',
    metro: 'Новочеркасская',
    coords: [59.9325, 30.4068],
    capacity: 'Банкет до 60 чел., своё пиво.',
    kids: 'Детской комнаты нет.',
    check: 'От 1900 ₽/чел. Чек 900-1500 ₽.',
    phone: '+7 (812) 528-24-37',
    site: 'https://schwabskidomik.ru/',
    yandex: 'https://yandex.ru/maps/?text=Швабский+домик+Новочеркасский+28+Санкт-Петербург',
    comment: 'Бюджетный вариант, но детям заняться нечем.',
  },
  {
    id: 'italica',
    name: 'Italica Bar',
    status: 'maybe',
    address: 'Финляндский пр., 4А',
    metro: 'Площадь Ленина',
    coords: [59.9573, 30.3531],
    capacity: 'Банкетная площадка-лофт.',
    kids: '',
    check: 'Сеты 2900–3900 ₽.',
    phone: '+7 (921) 559-39-37',
    site: '',
    yandex: 'https://yandex.ru/maps/?text=Italica+Bar+Финляндский+4А+Санкт-Петербург',
    comment: 'Близко к ВМИРЭ, ждём прайс-лист и план зала.',
  },
]

const STATUS_META = {
  go:    { color: 'var(--status-go)',    raw: '#2d8659', label: 'Подходит' },
  maybe: { color: 'var(--status-maybe)', raw: '#d4a548', label: 'Перепроверить' },
  no:    { color: 'var(--status-no)',    raw: '#b04444', label: 'Не подходит' },
}

const SPB_CENTER = [59.94, 30.31]

export default function Restaurants() {
  const mapRef = useRef(null)
  const markerRefs = useRef({})
  const cardRefs = useRef({})
  const [activeId, setActiveId] = useState(null)

  const focusOn = (rest, { scrollCard }) => {
    setActiveId(rest.id)
    const map = mapRef.current
    if (map) map.flyTo(rest.coords, 15, { duration: 1 })
    const marker = markerRefs.current[rest.id]
    if (marker) {
      setTimeout(() => marker.openPopup(), 300)
    }
    if (scrollCard) {
      const el = cardRefs.current[rest.id]
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <div className="section">
      <h2 className="section-title">Рестораны-кандидаты</h2>
      <p className="section-sub">Список заведений для обсуждения и голосования</p>

      <div className="rest-legend">
        {Object.entries(STATUS_META).map(([key, meta]) => (
          <div className="rest-legend-item" key={key}>
            <span className="rest-legend-dot" style={{background: meta.color}} />
            {meta.label}
          </div>
        ))}
      </div>

      <div className="rest-map-wrap">
        <MapContainer
          center={SPB_CENTER}
          zoom={12}
          scrollWheelZoom={true}
          ref={mapRef}
          attributionControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <AttributionControl prefix={false} position="bottomright" />
          {RESTAURANTS.map(r => {
            const meta = STATUS_META[r.status]
            return (
              <CircleMarker
                key={r.id}
                center={r.coords}
                radius={8}
                pathOptions={{
                  color: '#ffffff',
                  weight: 2,
                  fillColor: meta.raw,
                  fillOpacity: 1,
                }}
                ref={(layer) => { if (layer) markerRefs.current[r.id] = layer }}
                eventHandlers={{
                  click: () => focusOn(r, { scrollCard: true }),
                }}
              >
                <Popup>
                  <div className="rest-popup">
                    <b>{r.name}</b>
                    <br />
                    <span className="rest-popup-status" style={{background: meta.raw}}>{meta.label}</span>
                    <br />
                    <span style={{fontSize:'0.85rem', color:'#666'}}>{r.address}</span>
                  </div>
                </Popup>
              </CircleMarker>
            )
          })}
        </MapContainer>
      </div>

      <div className="rest-map-hint">
        Точки на карте — приблизительные. Для уточнения — кликните на ресторан и перейдите по ссылке «Карта».
      </div>

      <div className="rest-grid">
        {RESTAURANTS.map(r => {
          const meta = STATUS_META[r.status]
          const isActive = activeId === r.id
          return (
            <div
              key={r.id}
              ref={(el) => { if (el) cardRefs.current[r.id] = el }}
              className={`rest-card${isActive ? ' card-active' : ''}`}
              style={{'--status': meta.color}}
              onClick={() => focusOn(r, { scrollCard: false })}
            >
              <div className="rest-card-head">
                <h3>{r.name}</h3>
                <span className="rest-badge" style={{'--status': meta.color}}>{meta.label}</span>
              </div>
              <div className="rest-meta">
                {r.address}{r.metro && <> · м. {r.metro}</>}
              </div>
              <div className="rest-desc">
                {r.capacity}{r.kids && <> {r.kids}</>}
              </div>
              <div className="rest-check"><strong>Чек / банкет:</strong> {r.check}</div>
              <div className="rest-links" onClick={(e) => e.stopPropagation()}>
                {r.phone && (
                  <a href={`tel:${r.phone.replace(/[^+\d]/g, '')}`}>
                    📞 {r.phone}
                  </a>
                )}
                {r.site && (
                  <a href={r.site} target="_blank" rel="noopener noreferrer">Сайт</a>
                )}
                {r.yandex && (
                  <a href={r.yandex} target="_blank" rel="noopener noreferrer">Карта</a>
                )}
              </div>
              {r.comment && <div className="rest-comment">{r.comment}</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
