const menus = [
  { title: 'Product', items: ['Monitoring', 'Sensors', 'Pipelines', 'Realtime', 'Storage', 'Forecasts', 'Pricing'] },
  { title: 'Solutions', items: ['Enterprises', 'Manufacturing', 'Supply Chain', 'Startups', 'ESG Teams', 'Energy'] },
  { title: 'Resources', items: ['Blog', 'Support', 'System Status', 'Integrations', 'Security & Compliance', 'DPA'] },
  { title: 'Developers', items: ['Documentation', 'API & SDKs', 'Changelog', 'Open Source', 'Careers'] },
  { title: 'Company', items: ['About', 'General Availability', 'Terms', 'Privacy', 'Acceptable Use', 'SLA'] },
];

export { menus };

export function FooterMenus() {
  return (
    <div
      className="
        hidden lg:grid
        grid-flow-col
        auto-cols-[200px]
        gap-x-0
      "
    >
      {menus.map(({ title, items }) => (
        <nav key={title} className="w-[200px] text-left">
          <h4 className="text-[15px] font-medium text-neutral-200 tracking-tight">{title}</h4>
          <ul className="mt-10 space-y-5">
            {items.map(label => (
              <li key={label}>
                <a href="#" className="text-[15px] font-normal text-neutral-400 hover:text-neutral-200 transition-colors">{label}</a>
              </li>
            ))}
          </ul>
        </nav>
      ))}
    </div>
  );
}
