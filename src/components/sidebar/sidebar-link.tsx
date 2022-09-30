import { PropsOf, chakra, useColorModeValue, Flex } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { forwardRef, Ref, useEffect, useRef } from 'react'

const StyledLink = forwardRef(function StyledLink(
  props: PropsOf<typeof chakra.a> & { isActive?: boolean },
  ref: Ref<any>,
) {
  const { isActive, ...rest } = props

  return (
    <chakra.a
      aria-current={isActive ? 'page' : undefined}
      width='100%'
      px='3'
      py='1'
      rounded='md'
      ref={ref}
      fontSize='sm'
      fontWeight='500'
      color='fg'
      transition='all 0.2s'
      _activeLink={{
        bg: useColorModeValue('teal.50', 'rgba(48, 140, 122, 0.3)'),
        color: 'accent-emphasis',
        fontWeight: '600',
      }}
      {...rest}
    />
  )
})

type SidebarLinkProps = PropsOf<typeof chakra.div> & {
  href?: string
  icon?: React.ReactElement
}

function checkHref(href: string, slug: string | string[]) {
  const _slug = Array.isArray(slug) ? slug : [slug]
  const path = href.split('/')
  const pathSlug = path[path.length - 1]
  return _slug.includes(pathSlug)
}

const SidebarLink = ({ href, children, ...rest }: SidebarLinkProps) => {
  const router = useRouter()
  const isActive = checkHref(href, router.query.slug) || href === router.asPath

  const link = useRef<HTMLAnchorElement>()

  useEffect(() => {
    if (isActive && router.query.scroll === 'true') {
      link.current.scrollIntoView({ block: 'center' })
    }
  }, [isActive, router.query])

  return (
    <Flex as='li' align='center' userSelect='none' lineHeight='tall' {...rest}>
      <NextLink href={href} passHref>
        <StyledLink isActive={isActive} ref={link}>
          {children}
        </StyledLink>
      </NextLink>
    </Flex>
  )
}

export default SidebarLink
