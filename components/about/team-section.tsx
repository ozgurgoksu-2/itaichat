import { Card, CardContent } from "@/components/ui/card"
import { Linkedin } from "lucide-react"
import Image from "next/image"

export function TeamSection() {
  const teamMembers = [
    {
      name: "Mehmet Aksürmeli",
      expertise: "Business development, international sales, international marketing, lead generation, e-commerce",
      education: "METU - Business Administration (MSc)",
      photo: "/users/mehmet-aksurmeli.png",
      linkedin: "https://www.linkedin.com/in/aksurmeli/",
    },
    {
      name: "Faruk Özbaş",
      expertise:
        "Faruk is one of the co-founders of ArfCap and the co-director of Özyeğin University Center for Financial Engineering (CFE). He has 10 years of data driven consulting experience at CFE across various fields of finance.",
      education: "",
      photo: "/users/faruk-ozbas.png",
      linkedin: "",
    },
    {
      name: "Sanem Çankaya",
      expertise: "Business development, digital marketing, international marketing, data analysis, researching data",
      education: "TOBB ETU - Economics (B.Sc.)",
      photo: "/users/sanem.png",
      linkedin: "https://www.linkedin.com/in/snmcnky/",
    },
    {
      name: "Peker Çelik",
      expertise: "Artificial Intelligence, Machine Learning, End-to-End Software Solutions",
      education: "Özyeğin University - Computer Engineering (Undergraduate)",
      photo: "/users/peker-celik.png",
      linkedin: "",
    },
  ]

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
            Our
            <span className="bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent"> Team</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Meet the experts behind International Trade AI&apos;s success
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 lg:gap-12">
          {teamMembers.map((member, index) => (
            <Card
              key={index}
              className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white overflow-hidden"
            >
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center space-y-6">
                  {/* Profile Photo */}
                  <div className="relative">
                    <Image
                      src={member.photo || "/placeholder.svg"}
                      alt={member.name}
                      width={128}
                      height={128}
                      className="rounded-2xl object-cover shadow-lg group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 to-purple-600/20 rounded-2xl"></div>
                  </div>

                  {/* Name */}
                  <h3 className="text-2xl font-bold text-gray-900">{member.name}</h3>

                  {/* Expertise */}
                  <p className="text-gray-600 leading-relaxed text-sm">{member.expertise}</p>

                  {/* Education */}
                  {member.education && (
                    <p className="text-sm text-gray-500 font-medium border-t border-gray-100 pt-4 w-full">
                      {member.education}
                    </p>
                  )}

                  {/* LinkedIn Icon */}
                  {member.linkedin && (
                    <div className="pt-2">
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full text-white hover:scale-110 transition-transform duration-300"
                      >
                        <Linkedin className="w-5 h-5" />
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
