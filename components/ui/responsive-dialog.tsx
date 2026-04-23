import * as React from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { cn } from "@/lib/utils"

interface ResponsiveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  trigger?: React.ReactNode
  icon?: React.ReactNode
  desktopMaxWidth?: string
}

export function ResponsiveDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  trigger,
  icon,
  desktopMaxWidth = "max-w-md",
}: ResponsiveDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {trigger && <DialogTrigger render={trigger as any} />}
        <DialogContent className={cn(desktopMaxWidth)}>
          <DialogHeader>
            <div className="flex items-center gap-3">
              {icon && <div className="text-2xl">{icon}</div>}
              <div>
                <DialogTitle>{title}</DialogTitle>
                {description && <DialogDescription className="mt-1">{description}</DialogDescription>}
              </div>
            </div>
          </DialogHeader>
          <div className="px-1 py-2">{children}</div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent>
        <DrawerHeader className="text-left px-5 pt-5 pb-3">
          <div className="flex items-center gap-3 mb-2">
            {icon && <div className="text-2xl">{icon}</div>}
            <div>
              <DrawerTitle>{title}</DrawerTitle>
              {description && <DrawerDescription className="mt-1">{description}</DrawerDescription>}
            </div>
          </div>
        </DrawerHeader>
        <div className="px-5 pb-8">{children}</div>
      </DrawerContent>
    </Drawer>
  )
}
