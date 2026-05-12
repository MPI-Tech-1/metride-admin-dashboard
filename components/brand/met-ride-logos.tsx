import Image from "next/image"
import { cn } from "@/lib/utils"

type LogoProps = {
  className?: string
  priority?: boolean
  /**
   * Fill the parent box edge-to-edge (parent must be `relative` with explicit width & height).
   */
  fill?: boolean
}

/** Circular mark — favicon, sidebar (collapsed), compact headers. */
export function MetRideLogoMark({ className, priority, fill }: LogoProps) {
  if (fill) {
    return (
      <Image
        src="/logo-mark.png"
        alt="Met Ride"
        fill
        sizes="128px"
        className={cn("object-contain", className)}
        priority={priority}
      />
    )
  }

  return (
    <Image
      src="/logo-mark.png"
      alt="Met Ride"
      width={128}
      height={128}
      className={cn("object-contain", className)}
      priority={priority}
    />
  )
}

/** Square wordmark — login and marketing-style placements. */
export function MetRideLogoSquare({ className, priority, fill }: LogoProps) {
  if (fill) {
    return (
      <Image
        src="/logo-square.png"
        alt="Met Ride"
        fill
        sizes="(max-width: 1024px) 120px, 256px"
        className={cn("object-contain", className)}
        priority={priority}
      />
    )
  }

  return (
    <Image
      src="/logo-square.png"
      alt="Met Ride"
      width={256}
      height={256}
      className={cn("object-contain", className)}
      priority={priority}
    />
  )
}
