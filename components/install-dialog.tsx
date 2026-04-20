"use client";

import { useAtom } from "jotai";
import {
  CodeBlockCommand,
  convertNpmCommand,
} from "@/components/code-block-command/code-block-command";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { installDialogOpenAtom } from "@/lib/atoms/preset-ui";

export function InstallDialog({
  code,
  trigger,
}: {
  code: string;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useAtom(installDialogOpenAtom);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Apply this preset</DialogTitle>
          <DialogDescription>
            Start a new project with this preset, or apply it to an existing
            shadcn project.
          </DialogDescription>
        </DialogHeader>
        <div className="[--code:var(--popover)] flex min-w-0 flex-col gap-4">
          <div className="flex min-w-0 flex-col gap-2">
            <span className="text-xs font-medium text-foreground">
              Start a new project
            </span>
            <CodeBlockCommand
              {...convertNpmCommand(
                `npx shadcn@latest init --preset ${code} --template next`,
              )}
              prompt={`Scaffold a new Next.js shadcn project with preset ${code}`}
            />
          </div>
          {/* <span className="self-center text-xs text-muted-foreground">or</span> */}
          <div className="flex min-w-0 flex-col gap-2">
            <span className="text-xs font-medium text-foreground">
              Apply to an existing project
            </span>
            <CodeBlockCommand
              {...convertNpmCommand(`npx shadcn apply --preset ${code}`)}
              prompt={`Apply the preset ${code} to this shadcn project`}
            />
          </div>
        </div>
        <DialogFooter className="sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground sm:flex-1">
            No shadcn project yet?{" "}
            <a
              href="https://ui.shadcn.com/docs/installation"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 hover:text-foreground"
            >
              See the install guide
            </a>
            .
          </p>
          <DialogClose render={<Button variant="outline" size="sm" />}>
            Close
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
