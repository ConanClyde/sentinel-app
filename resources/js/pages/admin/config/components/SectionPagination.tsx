import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

interface PaginationInfo {
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    pagination?: PaginationInfo;
    routeName: string;
    mobile?: boolean;
}

export function SectionPagination({ pagination, routeName, mobile = false }: Props) {
    if (!pagination || pagination.last_page <= 1) return null;

    const pages = Array.from({ length: pagination.last_page }, (_, i) => i + 1);

    if (mobile) {
        return (
            <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-x p-4 md:hidden flex justify-center">
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious href={route(routeName) + '?page=' + (pagination.current_page - 1)} />
                        </PaginationItem>
                        {pages.map((page) => (
                            <PaginationItem key={page}>
                                <PaginationLink
                                    href={route(routeName) + '?page=' + page}
                                    isActive={pagination.current_page === page}
                                >
                                    {page}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext href={route(routeName) + '?page=' + (pagination.current_page + 1)} />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        );
    }

    return (
        <div className="hidden md:block">
            <div className="py-4 ml-auto w-fit">
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious href={route(routeName) + '?page=' + (pagination.current_page - 1)} />
                        </PaginationItem>
                        {pages.map((page) => (
                            <PaginationItem key={page}>
                                <PaginationLink
                                    href={route(routeName) + '?page=' + page}
                                    isActive={pagination.current_page === page}
                                >
                                    {page}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext href={route(routeName) + '?page=' + (pagination.current_page + 1)} />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    );
}
