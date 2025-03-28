import { Link } from "wouter";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconBgColor: string;
  iconColor: string;
  href: string;
}

export default function QuickActions() {
  const actions: QuickAction[] = [
    {
      id: "new-patient",
      title: "New Patient",
      description: "Create record",
      icon: "add_circle",
      iconBgColor: "bg-primary-light/10",
      iconColor: "text-primary-DEFAULT",
      href: "/patients"
    },
    {
      id: "scan-prescription",
      title: "Scan Prescription",
      description: "OCR recognition",
      icon: "document_scanner",
      iconBgColor: "bg-teal-400/10",
      iconColor: "text-teal-500",
      href: "/prescriptions"
    },
    {
      id: "post-surgery",
      title: "Post-Surgery",
      description: "Create documentation",
      icon: "build_circle",
      iconBgColor: "bg-amber-500/10",
      iconColor: "text-amber-500",
      href: "/post-surgery"
    },
    {
      id: "ai-summaries",
      title: "AI Summaries",
      description: "Generate report",
      icon: "auto_awesome",
      iconBgColor: "bg-green-500/10",
      iconColor: "text-green-500",
      href: "/patients"
    }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {actions.map(action => (
        <Link key={action.id} href={action.href}>
          <a className="bg-white shadow rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className={`${action.iconBgColor} p-3 rounded-full`}>
                <span className={`material-icons ${action.iconColor}`}>{action.icon}</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-neutral-800">{action.title}</h3>
                <p className="text-sm text-neutral-500">{action.description}</p>
              </div>
            </div>
          </a>
        </Link>
      ))}
    </div>
  );
}
