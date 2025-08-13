"use client";

import { useState } from 'react';

export default function GetAQuotePage() {
  const [status, setStatus] = useState<string | null>(null);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('Sending...');
    const form = e.currentTarget;
    const formData = new FormData(form);

    const res = await fetch('/api/quote', {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      setStatus('Thanks! We will respond within 24 hours.');
      form.reset();
    } else {
      setStatus('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="container py-14">
      <div className="text-center">
        <div className="badge inline-block">Start a Project</div>
        <h1 className="mt-3 text-3xl font-bold">Get a Quote</h1>
        <p className="mt-2 text-gray-600">Tell us the essentials and we’ll tailor a proposal.</p>
      </div>
      <form onSubmit={submit} className="mx-auto mt-8 max-w-2xl card p-6 grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Name</label>
            <input name="name" required className="mt-1 w-full rounded-lg border border-gray-200 p-3" />
          </div>
          <div>
            <label className="text-sm font-medium">Company</label>
            <input name="company" className="mt-1 w-full rounded-lg border border-gray-200 p-3" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input name="email" type="email" required className="mt-1 w-full rounded-lg border border-gray-200 p-3" />
          </div>
          <div>
            <label className="text-sm font-medium">Project Type</label>
            <select name="projectType" className="mt-1 w-full rounded-lg border border-gray-200 p-3">
              <option>Voice Over</option>
              <option>Audio Production / Jingle</option>
              <option>Podcast Editing</option>
              <option>Script Writing</option>
            </select>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Preferred Voice Type</label>
            <select name="voiceType" className="mt-1 w-full rounded-lg border border-gray-200 p-3">
              <option>Male</option>
              <option>Female</option>
              <option>Any</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Script Upload</label>
            <input name="script" type="file" accept=".pdf,.doc,.docx,.txt" className="mt-1 w-full rounded-lg border border-gray-200 p-3" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Project Details</label>
          <textarea name="details" rows={4} className="mt-1 w-full rounded-lg border border-gray-200 p-3" placeholder="Length, deadline, language(s), tone, references, budget..."></textarea>
        </div>
        <button type="submit" className="btn btn-primary w-fit">Submit</button>
        {status && <div className="text-sm text-gray-600">{status}</div>}
      </form>
    </div>
  );
}