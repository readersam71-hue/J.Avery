import { QuoteForm } from "@/components/sections/QuoteForm";
import { Star, Shield, Clock } from "lucide-react";

export default function QuotePage() {
  return (
    <main className="min-h-screen bg-slate-50 py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Get Your Free Quote</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Please provide a few details about your project or plumbing issue. 
              One of our expert team will review it and get back to you with a competitive, transparent quote.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            <div className="lg:col-span-2">
              <QuoteForm />
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                  <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                  <h3 className="font-bold text-slate-900">Highly Rated</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Join 42+ satisfied Birmingham homeowners who have rated us 5 stars for our professional service.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-blue-900" />
                  <h3 className="font-bold text-slate-900">Gas Safe Registered</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Your safety is our priority. All heating work is carried out by fully qualified and registered professionals.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-6 h-6 text-green-600" />
                  <h3 className="font-bold text-slate-900">Fast Response</h3>
                </div>
                <p className="text-sm text-slate-600">
                  We know plumbing issues can't wait. We aim to respond to all inquiries within 2 hours during business hours.
                </p>
              </div>

              <div className="p-6 bg-blue-900 rounded-2xl text-white">
                 <p className="font-bold mb-2">Water Emergency?</p>
                 <p className="text-sm text-blue-100 mb-4">Don't wait for a form. Call us immediately for the fastest response.</p>
                 <a href="tel:0121XXXXXXX" className="text-xl font-extrabold hover:underline">0121 XXX XXXX</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
