
// Navigation item
export interface NavItem { key: string; label: string;icon?: JSX.Element; }
// Section component props
export interface SectionItem { key: string; title: string; description?: string; control: JSX.Element; }
// CardOption group
export interface CardOptionItem { key: string; title: string; description?: string; }
export interface CardOptionGroup { key: string; title?: string; options: CardOptionItem[]; selectedKey: string; onChange: (key: string) => void; }
// Search index item
export interface SettingIndexItem { category: string; categoryLabel: string; key: string; title: string; }
// Category definition
export interface SettingCategory { key: string; label: string; metadata: () => SectionItem[]; component: React.FC<{}>;icon?: JSX.Element;}