
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-[#ea384c] mb-6">Terms of Service</h1>
        
        <div className="prose prose-lg max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Welp, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-3">2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of Welp for personal, non-commercial transitory viewing only.
              This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li>modify or copy the materials</li>
              <li>use the materials for any commercial purpose or for any public display</li>
              <li>attempt to reverse engineer any software contained on Welp</li>
              <li>remove any copyright or other proprietary notations from the materials</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-3">3. Disclaimer</h2>
            <p>
              The materials on Welp are provided on an 'as is' basis. Welp makes no warranties, expressed or implied, 
              and hereby disclaims and negates all other warranties including without limitation, implied warranties or 
              conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property 
              or other violation of rights.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-3">4. Limitations</h2>
            <p>
              In no event shall Welp or its suppliers be liable for any damages (including, without limitation, damages 
              for loss of data or profit, or due to business interruption) arising out of the use or inability to use the 
              materials on Welp, even if Welp or a Welp authorized representative has been notified orally or in writing 
              of the possibility of such damage. Because some jurisdictions do not allow limitations on implied warranties, 
              or limitations of liability for consequential or incidental damages, these limitations may not apply to you.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Accuracy of Materials</h2>
            <p>
              The materials appearing on Welp could include technical, typographical, or photographic errors. Welp does 
              not warrant that any of the materials on its website are accurate, complete, or current. Welp may make 
              changes to the materials contained on its website at any time without notice. However, Welp does not make 
              any commitment to update the materials.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Links</h2>
            <p>
              Welp has not reviewed all of the sites linked to our website and is not responsible for the contents of 
              any such linked site. The inclusion of any link does not imply endorsement by Welp of the site. Use of 
              any such linked website is at the user's own risk.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-3">7. Modifications</h2>
            <p>
              Welp may revise these terms of service for its website at any time without notice. By using this website, 
              you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-3">8. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of the United States 
              and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.
            </p>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Terms;
