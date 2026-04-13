import { Shield } from 'lucide-react';
import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement> & { className?: string }) {
    const { className } = props;
    return <Shield className={className?.replace('fill-current', '').trim()} />;
}
