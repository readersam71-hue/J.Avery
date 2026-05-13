"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";

const services = [
  "Emergency Plumbing",
  "Bathroom Transformation",
  "Boiler Service & Repair",
  "Kitchen Plumbing",
  "Other Repair/Maintenance"
];

const urgencies = [
  { label: "Emergency (Response within hours)", value: "emergency" },
  { label: "Soon (Next 1-2 days)", value: "soon" },
  { label: "Flexible (Planning ahead)", value: "flexible" }
];

export function QuoteForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    serviceType: "",
    urgency: "",
    details: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus("success");
        setFormData({
          name: "",
          email: "",
          phone: "",
          address: "",
          serviceType: "",
          urgency: "",
          details: ""
        });
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Inquiry Received!</h3>
        <p className="text-slate-600 mb-6">
          Thank you for choosing J.Avery Plumbing. James or one of the team will contact you shortly.
        </p>
        <Button onClick={() => setStatus("idle")}>Send Another Inquiry</Button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-slate-100">
      <h3 className="text-2xl font-bold text-slate-900 mb-6">Get a Fast, Free Quote</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Full Name</label>
            <input
              required
              type="text"
              placeholder="John Doe"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Phone Number</label>
            <input
              required
              type="tel"
              placeholder="07123 456789"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700">Email Address</label>
          <input
            required
            type="email"
            placeholder="john@example.com"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700">Service Required</label>
          <select
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-900 outline-none bg-white"
            value={formData.serviceType}
            onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
          >
            <option value="">Select a service...</option>
            {services.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700">Urgency</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {urgencies.map((u) => (
              <button
                key={u.value}
                type="button"
                onClick={() => setFormData({ ...formData, urgency: u.value })}
                className={cn(
                  "px-3 py-2 text-xs font-bold border rounded-lg transition-all",
                  formData.urgency === u.value 
                    ? "bg-blue-900 text-white border-blue-900 shadow-md" 
                    : "bg-white text-slate-600 border-slate-200 hover:border-blue-900"
                )}
              >
                {u.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700">Property Address / Area</label>
          <input
            required
            type="text"
            placeholder="e.g. Wylde Green, Birmingham"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700">Job Details</label>
          <textarea
            rows={3}
            placeholder="Please describe the issue or project..."
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-900 outline-none resize-none"
            value={formData.details}
            onChange={(e) => setFormData({ ...formData, details: e.target.value })}
          />
        </div>

        {status === "error" && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
            <AlertCircle className="w-5 h-5" />
            Something went wrong. Please try again or call us directly.
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full py-4 text-lg font-bold flex gap-2 items-center"
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Sending..." : (
            <>
              <Send className="w-5 h-5" />
              Request My Quote Now
            </>
          )}
        </Button>
        <p className="text-center text-xs text-slate-400">
          No obligation. Your data is protected and never shared.
        </p>
      </form>
    </div>
  );
}
