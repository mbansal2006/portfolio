import { Link } from "react-router-dom";
import { ArrowRight, Github, Mail } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Header */}
        <header className="mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-4">Mahir Bansal</h1>
          <p className="text-xl text-muted-foreground leading-relaxed mb-6">
            Tech, Govt., Markets
          </p>
          <div className="flex items-center gap-6 text-sm">
            <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Available for projects
          </span>
            <span className="text-muted-foreground">Washington, D.C. + St. Louis</span>
          </div>
        </header>

        {/* Navigation */}
        <nav className="mb-16">
          <div className="flex gap-8 text-sm">
            <Link 
              to="/thoughts" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              Writing
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
            <a href="#projects" className="text-muted-foreground hover:text-foreground transition-colors">
              Projects
            </a>
            <a href="#experience" className="text-muted-foreground hover:text-foreground transition-colors">
              Experience
            </a>
          </div>
        </nav>

        {/* About Section */}
        <section id="about" className="mb-16">
          <h2 className="text-3xl font-semibold text-foreground mb-6">About</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Hey! I'm Mahir. I'm a math student at WashU, and I spend most of my time thinking about where we're headed. For me that means asking about what future we want and how do we get there with what's in our toolbox. Over the past few years, I've been bouncing between internships and projects trying to learn more about each of these tools (tech, government, and markets). I've found that I'm most excited by applying those tools in high-stakes problems like health or development.
            </p>
            <p>
              Overall, I like learning by doing and thinking out loud. Always happy to chat.
            </p>

          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" className="mb-16">
          <h2 className="text-3xl font-semibold text-foreground mb-8">Projects</h2>
          <div className="space-y-8">
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-medium text-foreground">
                  <a href="https://github.com/mbansal2006/shravana" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    Shravana
                  </a>
                </h3>
                <span className="px-2 py-1 text-xs bg-primary/20 text-primary rounded-md">in progress</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Building ultra-lightweight AI applications for resource-constrained, offline enviornments.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Stack:</strong> Python, PostgreSQL, React, Whisper (STT), Gemma3n, RLHF (trlx, PPO) Coqui (TTS), Pi5
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-medium text-foreground">
                  <a href="https://github.com/mbansal2006/drug_monitor" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    Drug Monitor
                  </a>
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                A dashboard that maps where FDA-approved drugs are manufactured globally, using government data sources like DailyMed, OpenFDA, and the FDA's drug-shortage database. Includes filters for risk, trade compliance, and alliance membership.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Stack:</strong> Palantir Foundry, Ruby on Rails, PostgreSQL, React, Mapbox, FDA APIs
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-medium text-foreground">
                  <a href="https://regulations-comment-scraper.streamlit.app/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    Regulations Comment Downloader
                  </a>
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                A tool that scrapes public comments from regulations.gov dockets. Built to support fast analysis of stakeholder input during regulatory processes.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Stack:</strong> Python, Streamlit, Requests, Pandas
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-medium text-foreground">
                  <a href="http://assurenow.co/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    AssureNow
                  </a>
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                A past project to promote medication adherence through reminders and social accountability using trusted contacts. Combined SMS nudges, iOS notifications, and real-time check-ins to help patients stay on track with their prescriptions.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Stack:</strong> iOS (Swift), Svelte, Twilio, Firebase
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-medium text-foreground">
                  <a href="https://home.treasury.gov/system/files/236/20241106-PCLIA-ServiceNow-508.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    Internal Treasury Tool
                  </a>
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Designed and built an internal web application to track and streamline the renewal of Treasury contract vehicles, integrating with ServiceNow for task management and workflow automation.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Stack:</strong> JavaScript, ServiceNow, Jira, Confluence
              </p>
            </div>

          </div>
          
        </section>

        {/* Experience Section */}
        <section id="experience" className="mb-16">
          <h2 className="text-3xl font-semibold text-foreground mb-8">Experience</h2>
          <div className="space-y-8">
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-foreground">Product Lead, Applied AI</h3>
              <p className="text-muted-foreground font-medium">LAUNCH (Founder University)</p>
              <p className="text-muted-foreground leading-relaxed">
                Building lightweight AI applications (Shravana) in LAUNCH's Founder University Cohort 11.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-foreground">Health Policy Intern</h3>
              <p className="text-muted-foreground font-medium">Tiber Creek Group</p>
              <p className="text-muted-foreground leading-relaxed">
               Researched impacts of tariffs and budget reconciliation on healthcare clients, including supply chain exposure and revenue implications. Gained exposure to emerging tech policy issues, particularly around AI and federal regulatory strategy.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-foreground">Health Security and Government Affairs Intern</h3>
              <p className="text-muted-foreground font-medium">Medical Countermeasures Coalition (Todd Strategy Group)</p>
              <p className="text-muted-foreground leading-relaxed">
                Helped coordinate coalition strategy and rebuilt the public-facing website to highlight priorities across 20+ member organizations. Drafted sample statute on pharmaceutical quality standards and country-of-origin labeling. Co-authored a public comment in response to the Section 232 RFI on pharmaceutical supply-chain resilience.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium text-foreground">Legislative Intern</h3>
              <p className="text-muted-foreground font-medium">United States Senate</p>
              <p className="text-muted-foreground leading-relaxed">
                Researched Medicare reimbursement policy, biosimilar entry, and pharmacy benefit manager (PBM) reform. Wrote internal memos for the Senator's health policy team and tracked developments in drug pricing legislation.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium text-foreground">Enterprise Business Solutions Intern (Digital Service, Summer; Budget & Acquisition, Fall)</h3>
              <p className="text-muted-foreground font-medium">U.S. Department of the Treasury (Office of Chief Information Officer)</p>
              <p className="text-muted-foreground leading-relaxed">
                Served as a project management intern and developer on an Treasury team responsible for enterprise software solutions. Led daily scrum meetings, coordinated requirements gathering, and maintained sprint cycles using Jira and Confluence. Designed and scoped an internal web tool to track and streamline the renewal of Treasury contract vehicles, integrating with ServiceNow for task management.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium text-foreground">Spring Semester Senate Page</h3>
              <p className="text-muted-foreground font-medium">United States Senate</p>
              <p className="text-muted-foreground leading-relaxed">
                Supported day-to-day floor operations for the U.S. Senate, including chamber setup, document delivery, and exposure to the legislative process at close range during the 118th Congress. Nominated as one of twenty-seven students nationally.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium text-foreground">Health Economics Research Assistant</h3>
              <p className="text-muted-foreground font-medium">The Retina Institute</p>
              <p className="text-muted-foreground leading-relaxed">
                Developed an economic model to estimate administrative and patient time costs associated with anti-VEGF injection regimens. Contributed data analysis and writing to two abstracts presented at ASRS 2023. Also supported the application of this model to research on prior authorization burdens under Medicare Advantage, contributing to a peer-reviewed paper published in JAMA Ophthalmology.
              </p>
            </div>

          </div>
        </section>

        {/* Contact */}
        <footer className="pt-8 border-t border-border">
          <div className="flex items-center gap-6">
            <a 
              href="mailto:mb@mahirbansal.com" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="w-4 h-4" />
              Get in touch
            </a>
            <a 
              href="https://github.com/mbansal2006" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default Index;
