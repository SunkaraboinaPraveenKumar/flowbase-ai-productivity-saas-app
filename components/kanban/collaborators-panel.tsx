'use client';

import { Users, UserPlus } from 'lucide-react';
import { useState } from 'react';

export default function CollaboratorsPanel() {
  const [invitedEmail, setInvitedEmail] = useState('');
  const [collaborators, setCollaborators] = useState([
    { email: 'collab1@flowbase.ai', status: 'accepted', initials: 'C1' },
    { email: 'collab2@flowbase.ai', status: 'pending', initials: 'C2' }
  ]);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitedEmail.trim()) return;

    setCollaborators([...collaborators, {
      email: invitedEmail,
      status: 'pending',
      initials: invitedEmail.substring(0, 2).toUpperCase()
    }]);
    setInvitedEmail('');
  };

  return (
    <div className="flex items-center gap-3 bg-bg-card border border-border px-4 py-2.5 rounded-xl justify-between flex-wrap gap-y-2">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-accent-primary" />
        <span className="text-xs font-bold text-text-primary uppercase tracking-wider">Collaborators</span>
        
        {/* Avatars */}
        <div className="flex -space-x-1.5 ml-1">
          {collaborators.map((c, idx) => (
            <div
              key={idx}
              className={`w-6 h-6 rounded-full border border-bg-card flex items-center justify-center font-bold text-[8px] text-white select-none ${
                c.status === 'pending' ? 'bg-text-muted opacity-60' : 'bg-accent-secondary'
              }`}
              title={`${c.email} (${c.status})`}
            >
              {c.initials}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleInvite} className="flex gap-2 items-center">
        <input
          type="email"
          placeholder="colleague@email.com"
          value={invitedEmail}
          onChange={(e) => setInvitedEmail(e.target.value)}
          className="input-base text-[10px] py-1 px-2.5 bg-bg-secondary w-40"
          required
        />
        <button
          type="submit"
          className="button-primary text-[10px] py-1.5 px-3 flex items-center gap-1 font-semibold"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Invite</span>
        </button>
      </form>
    </div>
  );
}
