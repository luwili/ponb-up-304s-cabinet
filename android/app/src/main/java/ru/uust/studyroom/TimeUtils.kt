package ru.uust.studyroom

import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale
import java.util.TimeZone

object TimeUtils {
    private val UFA_TIMEZONE = TimeZone.getTimeZone("Asia/Yekaterinburg")
    private val RUSSIAN_LOCALE = Locale("ru", "RU")

    fun getUfaCalendar(): Calendar {
        return Calendar.getInstance(UFA_TIMEZONE)
    }

    /**
     * Day of week (1 = Mon ... 7 = Sun)
     */
    fun getUfaDayOfWeek(): Int {
        val cal = getUfaCalendar()
        return when (cal.get(Calendar.DAY_OF_WEEK)) {
            Calendar.MONDAY -> 1
            Calendar.TUESDAY -> 2
            Calendar.WEDNESDAY -> 3
            Calendar.THURSDAY -> 4
            Calendar.FRIDAY -> 5
            Calendar.SATURDAY -> 6
            Calendar.SUNDAY -> 7
            else -> 1
        }
    }

    fun getUfaDateString(): String {
        val cal = getUfaCalendar()
        val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.US)
        sdf.timeZone = UFA_TIMEZONE
        return sdf.format(cal.time)
    }

    fun getFormattedHeaderDate(): String {
        val cal = getUfaCalendar()
        val dayFormat = SimpleDateFormat("EEEE, d MMMM", RUSSIAN_LOCALE)
        dayFormat.timeZone = UFA_TIMEZONE
        val raw = dayFormat.format(cal.time)
        return raw.replaceFirstChar { if (it.isLowerCase()) it.titlecase(RUSSIAN_LOCALE) else it.toString() }
    }

    /**
     * Checks if current Ufa time is within [timeStart] (e.g. "08:00") and [timeEnd] (e.g. "09:20")
     */
    fun isPairNow(timeStart: String, timeEnd: String): Boolean {
        try {
            val cal = getUfaCalendar()
            val currentMinutes = cal.get(Calendar.HOUR_OF_DAY) * 60 + cal.get(Calendar.MINUTE)

            val (startH, startM) = timeStart.trim().split(":").map { it.toInt() }
            val (endH, endM) = timeEnd.trim().split(":").map { it.toInt() }

            val startTotal = startH * 60 + startM
            val endTotal = endH * 60 + endM

            return currentMinutes in startTotal..endTotal
        } catch (_: Exception) {
            return false
        }
    }
}
