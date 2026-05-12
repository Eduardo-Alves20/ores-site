import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import PageHeader from '../components/PageHeader';
import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { parseDateOnly, formatEventDate } from '../lib/date';

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const CAT_COLORS = {
  'Pastoral Familiar': '#6366f1',
  Juventude: '#f59e0b',
  'Evento Social': '#10b981',
  Oração: '#3b82f6',
  Oracao: '#3b82f6',
  Gestão: '#8b5cf6',
  Gestao: '#8b5cf6',
  Liturgia: '#ec4899',
  Campanha: '#ef4444',
  Paróquia: '#b8945a',
  Paroquia: '#b8945a',
};

export default function Calendario() {
  const { data: events } = useFetch('/events');
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) => (i < firstDay ? null : i - firstDay + 1));

  const eventsInMonth = (events || []).filter((ev) => {
    const d = parseDateOnly(ev.event_date);
    if (!d) return false;
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const eventsOnDay = (day) => eventsInMonth.filter((ev) => parseDateOnly(ev.event_date)?.getDate() === day);

  const prev = () => {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else setMonth((m) => m - 1);
  };

  const next = () => {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else setMonth((m) => m + 1);
  };

  return (
    <div className="animate-page">
      <PageHeader eyebrow="Paróquia" title="Calendário de Eventos" subtitle="Acompanhe as celebrações e atividades da nossa comunidade." />
      <section className="calendar-section" style={{ padding: '72px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div className="calendar-card" style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,.06)' }}>
          <div className="calendar-month-header" style={{ background: 'var(--navy)', padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button onClick={prev} style={{ color: '#fff', opacity: 0.7, padding: 8, borderRadius: 8, transition: 'opacity .15s' }} onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; }} onMouseLeave={(e) => { e.currentTarget.style.opacity = '.7'; }}>
              <ChevronLeft size={20} />
            </button>
            <h2 className="calendar-month-title" style={{ fontFamily: 'Playfair Display,serif', fontSize: 22, color: '#fff', fontWeight: 700 }}>{MONTHS[month]} {year}</h2>
            <button onClick={next} style={{ color: '#fff', opacity: 0.7, padding: 8, borderRadius: 8, transition: 'opacity .15s' }} onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; }} onMouseLeave={(e) => { e.currentTarget.style.opacity = '.7'; }}>
              <ChevronRight size={20} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', background: 'var(--cream-dark)', borderBottom: '1px solid var(--border)' }}>
            {DAYS.map((d) => (
              <div className="calendar-day-header" key={d} style={{ padding: '10px 0', textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-soft)' }}>{d}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
            {cells.map((day, idx) => {
              const isToday = day && new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
              const dayEvs = day ? eventsOnDay(day) : [];
              return (
                <div className="calendar-cell" key={idx} style={{ minHeight: 90, padding: 8, borderRight: idx % 7 < 6 ? '1px solid var(--cream-dark)' : 'none', borderBottom: '1px solid var(--cream-dark)', background: day ? '#fff' : 'var(--cream)', overflow: 'hidden' }}>
                  {day && (
                    <>
                      <div className="calendar-day-number" style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, marginBottom: 4, background: isToday ? 'var(--gold)' : 'transparent', color: isToday ? '#fff' : 'var(--text-mid)' }}>{day}</div>
                      {dayEvs.length > 0 && (
                        <div className="calendar-event-dots" aria-label={`${dayEvs.length} evento(s) neste dia`}>
                          {dayEvs.slice(0, 3).map((ev, i) => (
                            <span key={i} className="calendar-event-dot" style={{ background: CAT_COLORS[ev.category] || 'var(--navy)' }} title={ev.title} />
                          ))}
                          {dayEvs.length > 3 && <span className="calendar-event-more">+{dayEvs.length - 3}</span>}
                        </div>
                      )}
                      {dayEvs.map((ev, i) => (
                        <div className="calendar-event-chip" key={i} style={{ maxWidth: '100%', fontSize: 10, background: CAT_COLORS[ev.category] || 'var(--navy)', color: '#fff', borderRadius: 4, padding: '2px 5px', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={ev.title}>
                          {ev.start_time?.slice(0, 5)} {ev.title}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {eventsInMonth.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <h3 style={{ fontFamily: 'Playfair Display,serif', fontSize: 22, fontWeight: 700, color: 'var(--navy)', marginBottom: 20 }}>Eventos de {MONTHS[month]}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {eventsInMonth.map((ev, i) => {
                const color = CAT_COLORS[ev.category] || 'var(--navy)';
                return (
                  <div className="calendar-event-card" key={i} style={{ background: '#fff', borderRadius: 10, border: '1px solid var(--border)', padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{ width: 6, borderRadius: 3, alignSelf: 'stretch', background: color, flexShrink: 0 }} />
                    <div className="calendar-event-info" style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: 'var(--navy)', marginBottom: 4 }}>{ev.title}</div>
                      <div className="calendar-event-meta" style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-soft)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} />{formatEventDate(ev.event_date)} {ev.start_time?.slice(0, 5)}h{ev.end_time && `-${ev.end_time.slice(0, 5)}h`}</span>
                        {ev.location && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} />{ev.location}</span>}
                      </div>
                    </div>
                    {ev.category && <span className="calendar-event-category" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 100, background: `${color}22`, color }}>{ev.category}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
      <style>{`
        .calendar-event-dots {
          display: none;
        }
        @media (max-width: 700px) {
          .calendar-section {
            padding: 34px 14px 52px !important;
            max-width: 100% !important;
          }
          .calendar-card {
            border-radius: 14px !important;
          }
          .calendar-month-header {
            padding: 16px 12px !important;
          }
          .calendar-month-title {
            font-size: 19px !important;
            text-align: center;
          }
          .calendar-day-header {
            padding: 8px 0 !important;
            font-size: 9px !important;
            letter-spacing: 0 !important;
          }
          .calendar-cell {
            min-height: 52px !important;
            padding: 4px 3px !important;
            overflow: hidden !important;
          }
          .calendar-day-number {
            width: 22px !important;
            height: 22px !important;
            margin: 0 auto 4px !important;
            font-size: 11px !important;
          }
          .calendar-event-chip {
            display: none !important;
          }
          .calendar-event-dots {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 2px;
            max-width: 100%;
            min-height: 9px;
            overflow: hidden;
          }
          .calendar-event-dot {
            width: 6px;
            height: 6px;
            border-radius: 999px;
            flex: 0 0 auto;
          }
          .calendar-event-more {
            font-size: 9px;
            line-height: 1;
            font-weight: 800;
            color: var(--text-soft);
          }
          .calendar-event-card {
            align-items: flex-start !important;
            gap: 12px !important;
            padding: 14px !important;
          }
          .calendar-event-info {
            min-width: 0 !important;
          }
          .calendar-event-meta {
            flex-direction: column !important;
            gap: 6px !important;
          }
          .calendar-event-category {
            align-self: flex-start;
            max-width: 100%;
            white-space: normal;
            text-align: left;
          }
        }
        @media (max-width: 380px) {
          .calendar-section {
            padding-left: 10px !important;
            padding-right: 10px !important;
          }
          .calendar-cell {
            min-height: 46px !important;
            padding: 3px 2px !important;
          }
          .calendar-day-number {
            width: 20px !important;
            height: 20px !important;
            font-size: 10px !important;
          }
        }
      `}</style>
    </div>
  );
}
