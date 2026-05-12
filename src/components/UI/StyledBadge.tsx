import { Badge, styled, type BadgeProps } from "@mui/material";

const StyledBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
    '& .MuiBadge-badge': {
        right: -3,
        top: 13,
        border: `2px solid ${(theme.vars ?? theme).palette.background.paper}`,
        padding: '0 4px',
        backgroundColor: '#3730A3',
        color: 'white',
    },
}));

export default StyledBadge;