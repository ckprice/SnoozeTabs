/* exported timeForId */

import moment from 'moment';
import 'moment/min/locales.min';
moment.locale(browser.i18n.getUILanguage());

const NEXT_OPEN = 'next';
const PICK_TIME = 'pick';
export {NEXT_OPEN, PICK_TIME};

export const times = [
  {id: 'later', icon: 'later_today.svg', title: browser.i18n.getMessage('timeLaterToday')},
  {id: 'tomorrow', icon: 'tomorrow.svg', title: browser.i18n.getMessage('timeTomorrow')},
  {id: 'weekend', icon: 'weekends.svg', title: browser.i18n.getMessage('timeThisWeekend')},
  {id: 'week', icon: 'next_week.svg', title: browser.i18n.getMessage('timeNextWeek')},
  {id: 'month', icon: 'next_month.svg', title: browser.i18n.getMessage('timeNextMonth')},
  {id: NEXT_OPEN, icon: 'next_open.svg', title: browser.i18n.getMessage('timeNextOpen')},
  {id: PICK_TIME, icon: 'pick_date.svg', title: browser.i18n.getMessage('timePickADate')},
];

if (process.env.NODE_ENV === 'development') {
  times.unshift({ id: 'debug', icon: 'nightly.svg', title: browser.i18n.getMessage('timeRealSoonNow')});
}


const i18n_formats = ((locale) => {
  const formats = {
    default: {
      short_time: '[@] ha',
      short_date_time: 'ddd [@] ha',
      long_date_time: 'ddd MMM D \ [@] ha'
    },
    'it': {
      short_time: '[@] H',
      short_date_time: 'ddd [@] H',
      long_date_time: 'ddd D MMM \ [@] H'
    }
  };
  let rv = Object.assign({}, formats.default);
  const baseLocale = locale.split('_')[0];
  Object.keys(formats).forEach(key => {
    if (key.split(',').indexOf(baseLocale) !== -1) {
      rv = Object.assign(rv, formats[key]);
    }
  });
  Object.keys(formats).forEach(key => {
    if (key.split(',').indexOf(locale) !== -1) {
      rv = Object.assign(rv, formats[key]);
    }
  });
  return rv;
})(browser.i18n.getUILanguage() || 'en_US');

const getFormat = function (format) {
  return i18n_formats[format];
};

export function timeForId(time, id) {
  let rv = moment(time);
  let text = rv.fromNow();
  switch (id) {
    case 'debug':
      rv = rv.add(5, 'seconds');
      text = rv.format(getFormat('short_time'));
      break;
    case 'later':
      rv = rv.add(3, 'hours').minute(0);
      text = rv.format(getFormat('short_time'));
      break;
    case 'tomorrow':
      rv = rv.add(1, 'day').hour(9).minute(0);
      text = rv.format(getFormat('short_date_time'));
      break;
    case 'weekend':
      rv = rv.day(6).hour(9).minute(0);
      text = rv.format(getFormat('short_date_time'));
      break;
    case 'week':
      rv = rv.add(1, 'week').hour(9).minute(0);
      text = rv.format(getFormat('long_date_time'));
      break;
    case 'month':
      rv = rv.add(1, 'month').hour(9).minute(0);
      text = rv.format(getFormat('long_date_time'));
      break;
    case NEXT_OPEN:
      rv = NEXT_OPEN;
      text = '';
      break;
    case PICK_TIME:
      rv = null;
      text = '';
      break;
    default:
      break;
  }
  return [rv, text];
}

export function confirmationTime(time, timeType) {
  if (timeType === NEXT_OPEN) {
    return browser.i18n.getMessage('timeUpcomingNextOpen');
  }

  let rv;
  const endOfDay = moment().endOf('day');
  const endOfTomorrow = moment().add(1, 'day').endOf('day');
  const upcoming = moment(time);
  let timeStr = ']h';
  if (upcoming.minutes()) {
    timeStr += ':mm';
  }
  timeStr += 'a[';
  const weekday = ']ddd[';
  const month = ']MMM[';
  const date = ']D[';
  if (upcoming.isBefore(endOfDay)) {
    rv = `[${browser.i18n.getMessage('timeUpcomingToday', timeStr)}]`;
  } else if (upcoming.isBefore(endOfTomorrow)) {
    rv = `[${browser.i18n.getMessage('timeUpcomingTomorrow', timeStr)}]`;
  } else {
    rv = `[${browser.i18n.getMessage('timeUpcomingLater', [weekday, month, date, timeStr])}]`;
  }
  return upcoming.format(rv);
}
