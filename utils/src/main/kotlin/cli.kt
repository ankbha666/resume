package resume.utils

import com.google.code.linkedinapi.client.LinkedInApiClientFactory
import com.google.code.linkedinapi.client.oauth.LinkedInOAuthServiceFactory
import org.eclipse.jetty.servlet.ServletContextHandler
import org.eclipse.jetty.servlet.ServletHolder
import javax.servlet.http.HttpServlet
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse
import org.eclipse.jetty.server.Server
import com.google.code.linkedinapi.client.enumeration.ProfileField
import com.google.gson.Gson
import com.google.code.linkedinapi.client.oauth.LinkedInAccessToken
import java.net.URL
import java.net.HttpURLConnection
import com.google.gson.JsonParser
import com.google.code.linkedinapi.schema.EndDate
import com.google.code.linkedinapi.schema.StartDate
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.Date
import org.joda.time.DateTime

fun main(args: Array<String>) {
  val consumerKeyValue: String;
  val consumerSecretValue: String;
  if (args.size < 2) {
    println("Please specify linkedin app key and secret")
    return
  } else {
    consumerKeyValue = args[0]
    consumerSecretValue = args[1]
  }
  val port = 8080

  val oauthService = LinkedInOAuthServiceFactory.getInstance()!!.createLinkedInOAuthService(
      consumerKeyValue, consumerSecretValue)!!
  val requestToken = oauthService.getOAuthRequestToken("http://localhost:8080")
  val authUrl = requestToken!!.getAuthorizationUrl()

  val context = ServletContextHandler()
  val server = Server(port)
  server.setHandler(context)
  context.addServlet(ServletHolder(object : HttpServlet() {

    fun formatPeriod(start: StartDate?, end: EndDate?) : String {
      val startDate = if(start != null) {
        DateTime(start.getYear()?.toInt()?:2000, start.getMonth()?.toInt()?:1, start.getDay()?.toInt()?:1, 0, 0).toDate()
      } else {
        null
      }
      val endDate = if(end != null) {
        DateTime(end.getYear()?.toInt()?:2000, end.getMonth()?.toInt()?:1, end.getDay()?.toInt()?:1, 0, 0).toDate()
      } else {
        null
      }
      val format = SimpleDateFormat("MMMM, yyyy", Locale.US)
      if (startDate != null && endDate != null) {
        return format.format(startDate) + " - " + format.format(endDate)
      } else if (startDate != null) {
        return format.format(startDate)
      } else if (endDate != null ){
        return format.format(endDate)
      } else {
        return ""
      }
    }

    fun getProjects(accessToken: LinkedInAccessToken): List<Project> {
      val request = URL("https://api.linkedin.com/v1/people/~:(first-name,projects)?format=json")
          .openConnection() as HttpURLConnection
      oauthService.signRequestWithToken(request, accessToken)
      request.connect()
      return request.getInputStream()!!.use {
        JsonParser().parse(String(it.readBytes()))!!
            .getAsJsonObject()!!.get("projects")!!
            .getAsJsonObject()!!.get("values")!!
            .getAsJsonArray()!!.map {
          val obj = it.getAsJsonObject()!!
          Project(
              name = obj.get("name")!!.getAsString(),
              description = obj.get("description")!!.getAsString())
        }
      }
    }

    override fun doGet(req: HttpServletRequest?, resp: HttpServletResponse?) {
      val oauthVerifier = req!!.getParameter("oauth_verifier")
      val accessToken = oauthService.getOAuthAccessToken(requestToken, oauthVerifier)!!
      val factory = LinkedInApiClientFactory.newInstance(consumerKeyValue, consumerSecretValue)!!
      val client = factory.createLinkedInApiClient(accessToken)!!
      val profile = client.getProfileForCurrentUser(ProfileField.values().toSet())!!
      val resume = Resume(
          photoImageUrl = profile.getPictureUrl(),
          fullName = "${profile.getFirstName()} ${profile.getLastName()}",
          location = profile.getLocation()?.getName(),
          position = profile.getHeadline(),
          summary = profile.getSummary(),
          careerHistory = profile.getPositions()?.getPositionList()?.map {
            CareerHistoryItem(
                position = it.getTitle(),
                company = Company(name = it.getCompany()!!.getName()),
                period = formatPeriod(it.getStartDate(), it.getEndDate()),
                location = it.getLocation()?.getName())
          },
          skills = profile.getSkills()?.getSkillList()?.map {
            it.getSkill()?.getName() ?: ""
          }, projects = getProjects(accessToken))
      val writer = resp!!.getWriter()!!
      writer.write(Gson().toJson(resume)!!)
      resp.setContentType("application/json")
    }
  }), "/")

  println("Please open $authUrl to continue")
  server.start()
  server.join()
}

data class Resume (
    var photoImageUrl: String? = null,
    var location: String? = null,
    var fullName: String? = null,
    var position: String? = null,
    var summary: String? = null,
    var careerHistory: List<CareerHistoryItem>? = null,
    var skills: List<String>? = null,
    var projects: List<Project>? = null
)

data class CareerHistoryItem (
    var position: String? = null,
    var company: Company? = null,
    var period: String? = null,
    var location: String? = null
)

data class Company (
    var name: String? = null
)

data class Project (
    var name: String? = null,
    var description: String? = null
)