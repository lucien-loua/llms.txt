import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { url, maxUrls, firecrawlApiKey, openaiApiKey } = body

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Mapping phase
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              status: "mapping",
              totalUrls: 0,
              processedUrls: 0,
              errors: [],
              startTime: new Date(),
            })}\n\n`,
          ),
        )

        await new Promise((resolve) => setTimeout(resolve, 2000))

        const simulatedUrls = Math.min(maxUrls, Math.floor(Math.random() * 20) + 10)

        // Scraping phase
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              status: "scraping",
              totalUrls: simulatedUrls,
              processedUrls: 0,
              errors: [],
            })}\n\n`,
          ),
        )

        // Simulate scraping each URL
        const errors = []
        for (let i = 0; i < simulatedUrls; i++) {
          await new Promise((resolve) => setTimeout(resolve, 300))

          const currentUrl = i === 0 ? url : `${url}/${generatePagePath(i)}`

          // Simulate occasional errors (8% chance)
          if (Math.random() < 0.08) {
            errors.push({
              url: currentUrl,
              message: getRandomError(),
              timestamp: new Date(),
            })
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                status: "scraping",
                totalUrls: simulatedUrls,
                processedUrls: i + 1,
                currentUrl,
                errors: errors.slice(-3), // Only send last 3 errors
              })}\n\n`,
            ),
          )
        }

        // Generating phase
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              status: "generating",
              totalUrls: simulatedUrls,
              processedUrls: simulatedUrls,
              errors: errors,
            })}\n\n`,
          ),
        )

        await new Promise((resolve) => setTimeout(resolve, 3000))

        // Generate both files (always)
        const llmsTxtContent = generateSampleLlmsTxt(url, simulatedUrls)
        const llmsFullTxtContent = generateSampleLlmsFullTxt(url, simulatedUrls)

        // Completion
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              status: "completed",
              totalUrls: simulatedUrls,
              processedUrls: simulatedUrls,
              errors: errors,
              files: {
                llmsTxt: llmsTxtContent,
                llmsFullTxt: llmsFullTxtContent,
              },
            })}\n\n`,
          ),
        )
      } catch (error) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              status: "error",
              totalUrls: 0,
              processedUrls: 0,
              errors: [
                {
                  message: error instanceof Error ? error.message : "Unknown error",
                  timestamp: new Date(),
                },
              ],
            })}\n\n`,
          ),
        )
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}

function generatePagePath(index: number): string {
  const paths = [
    "about",
    "products",
    "services",
    "blog",
    "contact",
    "documentation",
    "support",
    "pricing",
    "faq",
    "team",
    "careers",
    "news",
    "resources",
    "tutorials",
    "api",
  ]
  return paths[index % paths.length]
}

function getRandomError(): string {
  const errors = [
    "Connection timeout after 30 seconds",
    "HTTP 403: Access forbidden",
    "HTTP 404: Page not found",
    "HTTP 429: Rate limit exceeded",
    "Failed to parse page content",
    "SSL certificate verification failed",
    "Content blocked by robots.txt",
    "JavaScript rendering timeout",
  ]
  return errors[Math.floor(Math.random() * errors.length)]
}

function generateSampleLlmsTxt(baseUrl: string, urlCount: number): string {
  const pages = [
    { title: "Home", desc: "Main landing page with company overview and navigation" },
    { title: "About Us", desc: "Company history, mission, values, and team information" },
    { title: "Products", desc: "Comprehensive product catalog with features and specifications" },
    { title: "Services", desc: "Professional services, consulting, and support offerings" },
    { title: "Blog", desc: "Latest news, insights, and industry updates" },
    { title: "Contact", desc: "Contact information, office locations, and inquiry forms" },
    { title: "Documentation", desc: "Technical guides, API reference, and user manuals" },
    { title: "Support", desc: "Help center, troubleshooting guides, and customer support" },
    { title: "Pricing", desc: "Pricing plans, subscription options, and billing information" },
    { title: "FAQ", desc: "Frequently asked questions and detailed answers" },
    { title: "Team", desc: "Meet our team members and leadership" },
    { title: "Careers", desc: "Job openings and career opportunities" },
    { title: "News", desc: "Press releases and company announcements" },
    { title: "Resources", desc: "Downloadable resources, whitepapers, and guides" },
    { title: "Tutorials", desc: "Step-by-step tutorials and learning materials" },
  ]

  let content = `# ${baseUrl} llms.txt\n\n`

  for (let i = 0; i < urlCount; i++) {
    const page = pages[i % pages.length]
    const pageUrl = i === 0 ? baseUrl : `${baseUrl}/${generatePagePath(i)}`
    content += `- [${page.title}](${pageUrl}): ${page.desc}\n`
  }

  return content
}

function generateSampleLlmsFullTxt(baseUrl: string, urlCount: number): string {
  let content = `# ${baseUrl} llms-full.txt\n\n`

  const sampleContents = [
    {
      title: "Home",
      content: `Welcome to our platform. We are a leading technology company providing innovative solutions for modern businesses. Our mission is to empower organizations with cutting-edge tools and services that drive growth and efficiency.

## Key Features
- Advanced analytics and reporting
- Seamless integration capabilities  
- Enterprise-grade security
- 24/7 customer support
- Scalable infrastructure

## Why Choose Us
We have been serving customers worldwide for over a decade, building trust through reliable service and continuous innovation. Our team of experts is dedicated to helping you achieve your business objectives.`,
    },
    {
      title: "About Us",
      content: `Founded in 2010, our company has grown from a small startup to a global leader in our industry. We believe in the power of technology to transform businesses and improve lives.

## Our Mission
To provide world-class solutions that enable our customers to achieve their full potential through innovative technology and exceptional service.

## Our Values
- Innovation: We constantly push the boundaries of what's possible
- Integrity: We conduct business with honesty and transparency
- Excellence: We strive for perfection in everything we do
- Collaboration: We work together to achieve common goals

## Company History
Starting with just three employees in a garage, we've expanded to over 500 team members across 15 countries. Our journey has been marked by continuous growth, strategic partnerships, and groundbreaking product launches.`,
    },
    {
      title: "Products",
      content: `Our comprehensive product suite is designed to meet the diverse needs of modern enterprises. Each solution is built with scalability, security, and user experience in mind.

## Product Categories

### Enterprise Solutions
- Business Intelligence Platform
- Customer Relationship Management
- Enterprise Resource Planning
- Supply Chain Management

### Developer Tools
- API Management Platform
- Code Repository and Version Control
- Continuous Integration/Deployment
- Performance Monitoring

### Cloud Services
- Infrastructure as a Service
- Platform as a Service
- Database as a Service
- Content Delivery Network

Each product comes with comprehensive documentation, training resources, and dedicated support to ensure successful implementation and adoption.`,
    },
  ]

  for (let i = 0; i < urlCount; i++) {
    const sampleIndex = i % sampleContents.length
    const sample = sampleContents[sampleIndex]
    const pageTitle = i < sampleContents.length ? sample.title : `Page ${i + 1}`
    const pageContent =
      i < sampleContents.length
        ? sample.content
        : `This is the content for ${pageTitle}. It contains detailed information about our services and offerings. Our platform provides comprehensive solutions for businesses of all sizes.

## Overview
We offer a wide range of services designed to help organizations achieve their goals. Our team of experts works closely with clients to understand their unique requirements and deliver customized solutions.

## Key Benefits
- Improved efficiency and productivity
- Cost-effective solutions
- Scalable architecture
- Expert support and guidance
- Proven track record of success

## Getting Started
Contact our team today to learn more about how we can help your organization succeed. We offer free consultations and can provide detailed proposals based on your specific needs.`

    content += `<|firecrawl-page-${i + 1}-lllmstxt|>\n\n`
    content += `## ${pageTitle}\n\n`
    content += `${pageContent}\n\n`
  }

  return content
}
