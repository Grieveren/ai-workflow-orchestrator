import { AlertTriangle } from 'lucide-react';
import type { TeamMember } from '../../../types';

const teamMembers: TeamMember[] = [
  {
    name: 'Sarah Chen',
    role: 'Data Analyst',
    activeRequests: 3,
    maxCapacity: 5,
    utilization: 60,
    skills: ['Reports', 'Dashboards', 'Data Analysis']
  },
  {
    name: 'Mike Torres',
    role: 'Salesforce Admin',
    activeRequests: 2,
    maxCapacity: 5,
    utilization: 40,
    skills: ['Automation', 'Workflows', 'Salesforce']
  },
  {
    name: 'Jennifer Kim',
    role: 'RevOps Manager',
    activeRequests: 4,
    maxCapacity: 5,
    utilization: 80,
    skills: ['Process Design', 'Strategy', 'Management']
  },
  {
    name: 'Alex Rivera',
    role: 'Systems Specialist',
    activeRequests: 2,
    maxCapacity: 5,
    utilization: 40,
    skills: ['Integrations', 'APIs', 'Technical Config']
  }
];

export function TeamCapacityWidget() {
  const averageUtilization = Math.round(
    teamMembers.reduce((sum, member) => sum + member.utilization, 0) / teamMembers.length
  );

  const getUtilizationColor = (utilization: number): string => {
    if (utilization >= 86) return 'bg-red-500';
    if (utilization >= 66) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getUtilizationBgColor = (utilization: number): string => {
    if (utilization >= 86) return 'bg-red-100';
    if (utilization >= 66) return 'bg-yellow-100';
    return 'bg-green-100';
  };

  const isOverloaded = (utilization: number): boolean => utilization > 85;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Team Capacity</h2>
        <div className="text-sm text-gray-600">
          Avg: <span className="font-semibold text-gray-800">{averageUtilization}%</span>
        </div>
      </div>

      {/* Team Member Cards */}
      <div className="space-y-4">
        {teamMembers.map((member) => (
          <div
            key={member.name}
            className="pb-4 border-b border-gray-100 last:border-b-0 last:pb-0"
          >
            {/* Name and Warning */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-800">{member.name}</span>
                {isOverloaded(member.utilization) && (
                  <AlertTriangle className="text-red-500" size={16} />
                )}
              </div>
            </div>

            {/* Role */}
            <p className="text-sm text-gray-600 mb-2">{member.role}</p>

            {/* Requests and Utilization */}
            <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
              <span>
                {member.activeRequests}/{member.maxCapacity} requests
              </span>
              <span>•</span>
              <span className="font-medium text-gray-800">
                {member.utilization}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className={`w-full h-2 rounded-full ${getUtilizationBgColor(member.utilization)}`}>
              <div
                className={`h-full rounded-full ${getUtilizationColor(member.utilization)} transition-all duration-300`}
                style={{ width: `${member.utilization}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
