'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

type Reservation = {
  id: string
  starts_at: string
  ends_at: string
  status: string
  aircraft: { registration: string } | null
  member: { full_name: string } | null
}

const HOUR_START = 7
const HOUR_END   = 21
const HOUR_PX    = 64

const statusColor: Record<string, string> = {
  aangevraagd: 'bg-yellow-100 border-yellow-300 text-yellow-900',
  bevestigd:   'bg-blue-100 border-blue-300 text-blue-900',
  geannuleerd: 'bg-gray-100 border-gray-300 text-gray-400 line-through',
}

function startOfWeek(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, n: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function toMinutes(iso: string) {
  const d = new Date(iso)
  return d.getHours() * 60 + d.getMinutes()
}

function topPx(iso: string) {
  return Math.max(0, (toMinutes(iso) / 60 - HOUR_START) * HOUR_PX)
}

function heightPx(start: string, end: string) {
  const mins = (new Date(end).getTime() - new Date(start).getTime()) / 60000
  return Math.max(20, (mins / 60) * HOUR_PX)
}

function isSameDay(iso: string, day: Date) {
  const d = new Date(iso)
  return (
    d.getFullYear() === day.getFullYear() &&
    d.getMonth() === day.getMonth() &&
    d.getDate() === day.getDate()
  )
}

const DAY_LABELS = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']
const MONTHS = ['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec']

export function WeekCalendar({ reservations }: { reservations: Reservation[] }) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const today = new Date()

  const weekLabel = (() => {
    const end = addDays(weekStart, 6)
    if (weekStart.getMonth() === end.getMonth()) {
      return `${weekStart.getDate()}–${end.getDate()} ${MONTHS[weekStart.getMonth()]} ${weekStart.getFullYear()}`
    }
    return `${weekStart.getDate()} ${MONTHS[weekStart.getMonth()]} – ${end.getDate()} ${MONTHS[end.getMonth()]} ${end.getFullYear()}`
  })()

  const hours = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i)

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <button
          onClick={() => setWeekStart(w => addDays(w, -7))}
          className="p-1 rounded hover:bg-gray-100"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium text-gray-700">{weekLabel}</span>
        <div className="flex gap-1">
          <button
            onClick={() => setWeekStart(startOfWeek(new Date()))}
            className="px-2 py-1 text-xs rounded border border-gray-200 hover:bg-gray-50 mr-1"
          >
            Vandaag
          </button>
          <button
            onClick={() => setWeekStart(w => addDays(w, 7))}
            className="p-1 rounded hover:bg-gray-100"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="flex border-b border-gray-200">
        <div className="w-12 shrink-0" />
        {days.map((day, i) => {
          const isToday = isSameDay(day.toISOString(), today)
          return (
            <div key={i} className="flex-1 text-center py-2">
              <p className="text-xs text-gray-400">{DAY_LABELS[i]}</p>
              <p className={`text-sm font-medium mt-0.5 w-7 mx-auto rounded-full leading-7 ${
                isToday ? 'bg-blue-600 text-white' : 'text-gray-800'
              }`}>
                {day.getDate()}
              </p>
            </div>
          )
        })}
      </div>

      {/* Time grid */}
      <div className="flex overflow-y-auto" style={{ maxHeight: '520px' }}>
        {/* Hours */}
        <div className="w-12 shrink-0 relative" style={{ height: (HOUR_END - HOUR_START) * HOUR_PX }}>
          {hours.map((h) => (
            <div key={h} className="absolute right-2 text-xs text-gray-400" style={{ top: (h - HOUR_START) * HOUR_PX - 6 }}>
              {String(h).padStart(2, '0')}
            </div>
          ))}
        </div>

        {/* Day columns */}
        {days.map((day, di) => {
          const dayReservations = reservations.filter((r) => isSameDay(r.starts_at, day))
          return (
            <div key={di} className="flex-1 relative border-l border-gray-100" style={{ height: (HOUR_END - HOUR_START) * HOUR_PX }}>
              {/* Hour lines */}
              {hours.map((h) => (
                <div
                  key={h}
                  className="absolute inset-x-0 border-t border-gray-100"
                  style={{ top: (h - HOUR_START) * HOUR_PX }}
                />
              ))}

              {/* Reservations */}
              {dayReservations.map((r) => (
                <Link
                  key={r.id}
                  href={`/dashboard/reserveringen/${r.id}/bewerken`}
                  className={`absolute inset-x-0.5 rounded border text-xs px-1 py-0.5 overflow-hidden hover:opacity-80 transition-opacity ${statusColor[r.status] ?? 'bg-gray-100 border-gray-300'}`}
                  style={{
                    top:    topPx(r.starts_at),
                    height: heightPx(r.starts_at, r.ends_at),
                  }}
                >
                  <p className="font-semibold leading-tight truncate">
                    {r.aircraft?.registration ?? '—'}
                  </p>
                  <p className="truncate opacity-75">{r.member?.full_name ?? '—'}</p>
                </Link>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
