'use client';
import {createContext,useContext,type ReactNode} from 'react';
import {createPortal} from 'react-dom';
/** Undefined outside a shell; null while its real toolbar host is attaching. */
export const WorkspaceToolbarContext=createContext<HTMLElement|null|undefined>(undefined);
export function WorkspaceToolbar({children}:{children:ReactNode}){const host=useContext(WorkspaceToolbarContext);return host===undefined?<>{children}</>:host?createPortal(children,host):null;}
