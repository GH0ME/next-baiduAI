import { ReactNode } from "react";
import { usePathname } from 'next/navigation'
//返回当前地址的路径名 --> 引用这个组件的组件也必须设置为客户端组件才能用usePathname
import Link from "next/link";
import { startLoading } from "../../util/controlLoading";

type NavLinkProps = {
  children:ReactNode;
  href:string;
};

const NavLink = (props: NavLinkProps) => {
  const pathName = usePathname()
  
  return <Link href={props.href} className={pathName===props.href?'active':''} onClick={startLoading}>
    {props.children}
  </Link>
}

export default NavLink;
