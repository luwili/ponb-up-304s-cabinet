package ru.uust.studyroom

import android.content.Context
import org.json.JSONObject
import java.io.File
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL

data class PairItem(
    val id: String,
    val pairNumber: Int,
    val timeStart: String,
    val timeEnd: String,
    val subjectName: String,
    val teacher: String,
    val room: String,
    val type: String,
    val isCurrent: Boolean
)

data class DaySchedule(
    val dayName: String,
    val date: String,
    val weekNumber: Int,
    val isToday: Boolean,
    val pairs: List<PairItem>
)

object ScheduleRepository {
    private const val CACHE_FILE_NAME = "cached_schedule.json"
    private const val PRIMARY_URL = "https://luwili.github.io/study_room/data/schedule.json"
    private const val FALLBACK_URL = "https://raw.githubusercontent.com/luwili/study_room/main/src/data/schedule.json"

    fun fetchAndCache(context: Context): Boolean {
        for (urlStr in listOf(PRIMARY_URL, FALLBACK_URL)) {
            try {
                val url = URL(urlStr)
                val conn = url.openConnection() as HttpURLConnection
                conn.connectTimeout = 5000
                conn.readTimeout = 7000
                conn.requestMethod = "GET"
                conn.connect()

                if (conn.responseCode == HttpURLConnection.HTTP_OK) {
                    val content = conn.inputStream.bufferedReader().use { it.readText() }
                    if (content.isNotBlank() && content.contains("ПОНБ-УП-304С")) {
                        val cacheFile = File(context.filesDir, CACHE_FILE_NAME)
                        cacheFile.writeText(content)
                        return true
                    }
                }
            } catch (e: Exception) {
                // Try fallback URL
            }
        }
        return false
    }

    fun getTodaySchedule(context: Context): DaySchedule {
        val cacheFile = File(context.filesDir, CACHE_FILE_NAME)
        val jsonString = if (cacheFile.exists()) {
            cacheFile.readText()
        } else {
            // First time: try online fetch synchronously
            fetchAndCache(context)
            if (cacheFile.exists()) cacheFile.readText() else ""
        }

        if (jsonString.isBlank()) {
            return DaySchedule("Сегодня", TimeUtils.getUfaDateString(), 8, true, emptyList())
        }

        return try {
            val root = JSONObject(jsonString)
            val currentWeekNumber = root.optInt("currentWeekNumber", 8)
            val dayOfWeek = TimeUtils.getUfaDayOfWeek()
            val todayDate = TimeUtils.getUfaDateString()

            // If Sunday (7), show Monday's schedule of upcoming week
            val targetDayOfWeek = if (dayOfWeek == 7) 1 else dayOfWeek
            val targetWeekNumber = if (dayOfWeek == 7) currentWeekNumber + 1 else currentWeekNumber

            var targetDayObj: JSONObject? = null

            // 1. Check in "weeks" map
            if (root.has("weeks")) {
                val weeksObj = root.optJSONObject("weeks")
                val weekObj = weeksObj?.optJSONObject(targetWeekNumber.toString())
                if (weekObj != null && weekObj.has("days")) {
                    val daysArr = weekObj.optJSONArray("days")
                    if (daysArr != null) {
                        for (i in 0 until daysArr.length()) {
                            val d = daysArr.optJSONObject(i) ?: continue
                            if (d.optInt("dayOfWeek") == targetDayOfWeek) {
                                targetDayObj = d
                                break
                            }
                        }
                    }
                }
            }

            // 2. Fallback to root "days"
            if (targetDayObj == null && root.has("days")) {
                val daysArr = root.optJSONArray("days")
                if (daysArr != null) {
                    for (i in 0 until daysArr.length()) {
                        val d = daysArr.optJSONObject(i) ?: continue
                        if (d.optInt("dayOfWeek") == targetDayOfWeek) {
                            targetDayObj = d
                            break
                        }
                    }
                }
            }

            if (targetDayObj == null) {
                return DaySchedule("Сегодня", todayDate, currentWeekNumber, true, emptyList())
            }

            val dayName = targetDayObj.optString("dayName", "Сегодня")
            val dateStr = targetDayObj.optString("date", todayDate)
            val pairsArr = targetDayObj.optJSONArray("pairs")
            val pairsList = mutableListOf<PairItem>()

            if (pairsArr != null) {
                for (i in 0 until pairsArr.length()) {
                    val p = pairsArr.optJSONObject(i) ?: continue
                    val tStart = p.optString("timeStart", "")
                    val tEnd = p.optString("timeEnd", "")
                    val isCurrent = if (dayOfWeek <= 6 && targetWeekNumber == currentWeekNumber) {
                        TimeUtils.isPairNow(tStart, tEnd)
                    } else false

                    pairsList.add(
                        PairItem(
                            id = p.optString("id", "pair-$i"),
                            pairNumber = p.optInt("pairNumber", i + 1),
                            timeStart = tStart,
                            timeEnd = tEnd,
                            subjectName = p.optString("subjectName", "Предмет"),
                            teacher = p.optString("teacher", ""),
                            room = p.optString("room", ""),
                            type = p.optString("type", "Семинар"),
                            isCurrent = isCurrent
                        )
                    )
                }
            }

            DaySchedule(
                dayName = dayName,
                date = dateStr,
                weekNumber = targetWeekNumber,
                isToday = dayOfWeek != 7,
                pairs = pairsList
            )
        } catch (e: Exception) {
            DaySchedule("Сегодня", TimeUtils.getUfaDateString(), 8, true, emptyList())
        }
    }
}
