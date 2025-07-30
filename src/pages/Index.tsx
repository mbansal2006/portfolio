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
            Technology, Government, Markets
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
              I’m a student at Washington University in St. Louis, double majoring in Math and Philosophy with a focus on the philosophy of science.
            </p>
            <p>
              I’ve worked at the U.S. Treasury, in the Senate, and in health policy consulting, mostly on projects that combine public data with lightweight software to make sense of messy systems. I like building tools that make hard things easier, whether that means tracking a moving target, finding the right signal, or helping people understand something that matters.
            </p>
            <p>
              Right now I’m focused on using AI and frontier technologies to solve real problems. I'm excited about the wave of change that’s happening and I want to be part of it. Whether it’s analyzing regulatory comments, mapping supply chains, or building something totally new, I care about making these tools useful in the real world.
            </p>
            <p>
              I’ve also been writing essays on the future of intelligence and technology. The first set, called <em>The Endurance of Intelligence</em>, explores how things stretch toward infinity or collapse to zero. You can find those under “Thoughts.”
            </p>
            <p>
              Always up for interesting problems, honest conversations, and building things that matter.
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
                A system leveraging AI to deliver granular and actionable policy intelligence.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Stack:</strong> Python, PostgreSQL, WhisperX, React, and uses Llama 4 Maverick with Reinforcement Learning from Human Feedback (RLHF) for tailored summarization and alert optimization
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-medium text-foreground">
                  <a href="https://github.com/mbansal2006/drug_monitor" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    Drug Monitor
                  </a>
                </h3>
                <span className="px-2 py-1 text-xs bg-primary/20 text-primary rounded-md">in progress</span>
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
              <h3 className="text-lg font-medium text-foreground">Health Security and Government Affairs Intern</h3>
              <p className="text-muted-foreground font-medium">Medical Countermeasures Coalition (Todd Strategy Group)</p>
              <p className="text-muted-foreground leading-relaxed">
                Helped coordinate coalition strategy and rebuilt the public-facing website to highlight priorities across 20+ member organizations. Drafted sample statute on pharmaceutical quality standards and country-of-origin labeling. Co-authored a public comment in response to the Section 232 RFI on pharmaceutical supply-chain resilience.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium text-foreground">Legislative Intern</h3>
              <p className="text-muted-foreground font-medium">United States Senate (Office of Senator Tim Kaine)</p>
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
              <h3 className="text-lg font-medium text-foreground">Spring Semester Senate Page (Nominated by Sen. Tim Kaine)</h3>
              <p className="text-muted-foreground font-medium">United States Senate</p>
              <p className="text-muted-foreground leading-relaxed">
                Supported day-to-day floor operations for the U.S. Senate, including chamber setup, document delivery, and exposure to the legislative process at close range during the 118th Congress.
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
